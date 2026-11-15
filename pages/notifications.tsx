/**
 * pages/notifications.tsx - 알림함 (/notifications)
 *
 * 관심상품에 설정한 조건(가격 하락, 목표 가격·할인율 도달, 재입고)이 맞으면 서버가 알림을 만듭니다.
 * 이 페이지는 그 목록을 최신순으로 보여주고, 누르면 읽음 처리한 뒤 상품 상세로 이동합니다.
 *
 * - 사용자별 내용이라 검색 엔진에 노출하지 않습니다(noindex, 사이트맵에도 없음).
 * - 서버 렌더링하지 않고 브라우저에서 가져옵니다(익명 ID가 브라우저 localStorage에 있기 때문).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Notifications.module.css';
import type { NotificationItem, NotificationType } from '../types';
import { appendUniqueById } from '../utils/favoriteSync';
import { getNotifications, isUserFeatureAvailable, markNotificationRead } from '../utils/userApi';

/** 알림 종류의 화면 표시 이름 */
const TYPE_LABELS: Record<NotificationType, string> = {
  PRICE_DROP: '가격 하락',
  TARGET_PRICE_REACHED: '목표가 도달',
  TARGET_DISCOUNT_REACHED: '목표 할인율',
  BACK_IN_STOCK: '재입고',
};

type Status = 'loading' | 'ready' | 'error' | 'unavailable';

const formatWon = (price: number): string => `${price.toLocaleString('ko-KR')}원`;

/** 발생 시각을 "12분 전", "어제", "11월 6일"처럼 짧게 표시합니다. */
function formatWhen(isoString: string, now: Date = new Date()): string {
  const time = new Date(isoString);
  if (Number.isNaN(time.getTime())) {
    return '';
  }
  const minutes = Math.floor((now.getTime() - time.getTime()) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  if (hours < 48) return '어제';
  return `${time.getMonth() + 1}월 ${time.getDate()}일`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // 같은 알림을 연달아 눌러도 읽음 요청이 한 번만 나가게 합니다.
  const openingRef = useRef<Set<string>>(new Set());

  const loadPage = useCallback(async (pageNumber: number) => {
    const result = await getNotifications(pageNumber);
    // 첫 페이지 이후 새 알림이 생기면 다음 페이지에 이미 본 항목이 다시 오므로 id로 중복을 거릅니다.
    setItems((previous) => (pageNumber === 0 ? result.content : appendUniqueById(previous, result.content)));
    setPage(pageNumber);
    setHasMore(!result.last);
  }, []);

  const loadFirstPage = useCallback(() => {
    if (!isUserFeatureAvailable()) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    loadPage(0)
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, [loadPage]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleLoadMore = async () => {
    if (loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      await loadPage(page + 1);
    } catch {
      // 더 보기 실패는 목록을 그대로 두고 버튼으로 다시 시도할 수 있게 합니다.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpen = async (item: NotificationItem) => {
    if (openingRef.current.has(item.id)) {
      return;
    }
    openingRef.current.add(item.id);
    try {
      if (!item.read) {
        await markNotificationRead(item.id);
        setItems((previous) => previous.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
      }
    } catch {
      // 읽음 처리가 실패해도 상품으로는 이동합니다.
    } finally {
      openingRef.current.delete(item.id);
    }
    // 상품이 이미 삭제됐다면 상세 페이지가 "상품을 찾을 수 없습니다"를 보여줍니다.
    void router.push(`/product/${encodeURIComponent(item.productId)}`);
  };

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <>
      <Head>
        <title>알림 | DUPE</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.backLink}>← 홈으로</Link>
            <Link href="/favorites" className={styles.backLink}>찜한 상품</Link>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.pageHead}>
            <p className={styles.eyebrow}>Notifications</p>
            <h1 className={styles.title}>
              알림
              {unreadCount > 0 && <span className={styles.titleCount}>{unreadCount}</span>}
            </h1>
          </div>

          {status === 'loading' && <p className={styles.state} role="status">알림을 불러오는 중입니다…</p>}

          {status === 'unavailable' && (
            <p className={styles.state}>이 브라우저에서는 알림을 저장할 수 없습니다.</p>
          )}

          {status === 'error' && (
            <div className={styles.state} role="alert">
              <p>알림을 불러오지 못했습니다.</p>
              <button type="button" className={styles.ghostButton} onClick={loadFirstPage}>다시 시도</button>
            </div>
          )}

          {status === 'ready' && items.length === 0 && (
            <div className={styles.empty}>
              <strong>아직 알림이 없습니다</strong>
              <p>상품 상세에서 &ldquo;가격 알림 받기&rdquo;를 눌러 목표 가격을 설정해 보세요.</p>
            </div>
          )}

          {status === 'ready' && items.length > 0 && (
            <>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`${styles.row} ${item.read ? '' : styles.unread}`}
                      onClick={() => handleOpen(item)}
                    >
                      <span className={styles.tag}>{TYPE_LABELS[item.type] ?? '알림'}</span>
                      <span className={styles.body}>
                        <span className={styles.rowTitle}>
                          {!item.read && <span className={styles.srOnly}>읽지 않음: </span>}
                          {item.title}
                        </span>
                        <span className={styles.rowMessage}>{item.message}</span>
                        {item.previousPrice !== null && item.currentPrice !== null && (
                          <span className={styles.rowPrice}>
                            <s>{formatWon(item.previousPrice)}</s>
                            {' → '}
                            <b>{formatWon(item.currentPrice)}</b>
                          </span>
                        )}
                      </span>
                      <span className={styles.when}>{formatWhen(item.occurredAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className={styles.more}>
                  <button type="button" className={styles.ghostButton} onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? '불러오는 중…' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
