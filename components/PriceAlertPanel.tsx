/**
 * components/PriceAlertPanel.tsx - 상품 상세의 가격 알림 설정
 *
 * 흐름:
 * 1) 관심상품이 아니면 "가격 알림 받기" 버튼만 보입니다. 누르면 관심상품으로 등록하고 패널을 엽니다.
 * 2) 패널에서 목표 가격과 알림 종류(가격 하락, 재입고)를 정해 저장합니다.
 *
 * 알아둘 점:
 * - 저장 API(PUT /watchlist/{id}/alerts)는 "전체 교체"입니다. 화면에 없는 값(목표 할인율, 선호 색상·사이즈)도
 *   기존 값을 그대로 다시 보내야 지워지지 않습니다.
 * - 서버는 저장할 때마다 알림 조건 버전을 올립니다. 바뀐 것이 없으면 요청을 보내지 않습니다.
 * - 서버는 저장 직후 조건을 바로 평가합니다. 목표 가격이 현재가 이상이면 곧바로 알림이 생기므로
 *   현재가보다 낮은 값만 받습니다(utils/targetPrice.ts).
 * - localStorage를 쓸 수 없는 브라우저에서는 이 패널을 그리지 않습니다.
 */

import { useEffect, useId, useState } from 'react';
import styles from '../styles/PriceAlertPanel.module.css';
import type { AlertSettings, Product, WatchlistItem } from '../types';
import { parseTargetPrice } from '../utils/targetPrice';
import { isUserFeatureAvailable, updateAlertSettings } from '../utils/userApi';

interface PriceAlertPanelProps {
  product: Product;
  /** 서버 관심상품 항목. 아직 등록되지 않았거나 등록 중이면 undefined */
  watchlistItem: WatchlistItem | undefined;
  /** 관심상품으로 등록(또는 서버와 다시 맞춤)을 시작합니다. */
  onSubscribe: () => void;
  /** 이 상품이 찜 상태인지. 등록 요청이 실패하면 false로 돌아옵니다. */
  subscribed: boolean;
  /** 저장이 끝난 뒤 서버가 돌려준 최신 항목을 넘깁니다. */
  onSaved: (item: WatchlistItem) => void;
}

type Notice = { kind: 'info' | 'saved' | 'error'; text: string };

const RECHECK_NOTE = '가격은 약 15분마다 다시 확인됩니다.';

const formatInput = (price: number | null): string => (price ? price.toLocaleString('ko-KR') : '');

export default function PriceAlertPanel({ product, watchlistItem, subscribed, onSubscribe, onSaved }: PriceAlertPanelProps) {
  const inputId = useId();
  // 서버 렌더링 결과와 첫 클라이언트 렌더링이 같도록, 사용 가능 여부는 마운트 뒤에 확인합니다.
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [priceDrop, setPriceDrop] = useState(true);
  const [restock, setRestock] = useState(true);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>({ kind: 'info', text: RECHECK_NOTE });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAvailable(isUserFeatureAvailable());
  }, []);

  // 서버 값이 도착하거나 "값이" 바뀌면 입력란을 그 값으로 맞춥니다.
  // 객체가 아니라 값에 의존합니다. 동기화는 값이 같아도 매번 새 객체를 만들기 때문에,
  // 객체에 의존하면 입력하는 도중에 동기화가 끝날 때 입력하던 값이 지워집니다.
  const savedId = watchlistItem?.watchlistId;
  const savedTarget = watchlistItem?.targetPrice ?? null;
  const savedPriceDrop = watchlistItem?.priceDropAlertEnabled;
  const savedRestock = watchlistItem?.restockAlertEnabled;
  useEffect(() => {
    if (savedId === undefined || savedPriceDrop === undefined || savedRestock === undefined) {
      return;
    }
    setTargetInput(formatInput(savedTarget));
    setPriceDrop(savedPriceDrop);
    setRestock(savedRestock);
    setFieldError(null);
  }, [savedId, savedTarget, savedPriceDrop, savedRestock]);

  if (!available) {
    return null;
  }

  const handleToggleOpen = () => {
    if (!watchlistItem) {
      onSubscribe(); // 등록이 끝나면 부모가 watchlistItem을 내려줍니다.
    }
    setOpen((previous) => !previous);
  };

  const handleSave = async () => {
    if (!watchlistItem || saving) {
      return;
    }

    // 목표 가격은 비워 둘 수 있습니다(가격 하락·재입고 알림만 받는 경우).
    let targetPrice: number | null = null;
    if (targetInput.trim()) {
      const parsed = parseTargetPrice(targetInput, product.salePrice);
      if (!parsed.ok) {
        setFieldError(parsed.reason);
        return;
      }
      targetPrice = parsed.value;
    }
    setFieldError(null);

    const unchanged =
      targetPrice === watchlistItem.targetPrice &&
      priceDrop === watchlistItem.priceDropAlertEnabled &&
      restock === watchlistItem.restockAlertEnabled;
    if (unchanged) {
      setNotice({ kind: 'info', text: '변경된 내용이 없습니다.' });
      return;
    }

    const settings: AlertSettings = {
      targetPrice,
      targetDiscountRate: watchlistItem.targetDiscountRate, // 화면에 없는 값은 그대로 유지
      priceDropAlertEnabled: priceDrop,
      restockAlertEnabled: restock,
      preferredColors: watchlistItem.preferredColors ?? [],
      preferredSizes: watchlistItem.preferredSizes ?? [],
    };

    setSaving(true);
    try {
      // 응답으로 받은 최신 항목을 바로 반영합니다. 다시 조회하는 데 의존하면, 조회가 실패했을 때
      // 화면이 옛 값을 기준으로 "바뀜"이라고 판단해 같은 저장 요청을 또 보낼 수 있습니다.
      const saved = await updateAlertSettings(String(product.id), settings);
      setNotice({ kind: 'saved', text: `저장했습니다. ${RECHECK_NOTE}` });
      onSaved(saved);
    } catch {
      setNotice({ kind: 'error', text: '알림 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
    } finally {
      setSaving(false);
    }
  };

  const buttonLabel = !watchlistItem ? '가격 알림 받기' : open ? '가격 알림 설정 닫기' : '가격 알림 설정';

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.openButton} onClick={handleToggleOpen} aria-expanded={open}>
        {buttonLabel}
      </button>

      {open && (
        <section className={styles.panel} aria-label="가격 알림 설정">
          <h3 className={styles.title}>가격 알림</h3>

          {!watchlistItem ? (
            <div className={styles.pending} role="status">
              {/* 등록 요청이 실패하면 찜 상태가 되돌아오므로(subscribed=false) 그 사실을 알리고 다시 시도하게 합니다. */}
              <p>{subscribed ? '관심상품에 등록하는 중입니다…' : '관심상품에 등록하지 못했습니다.'}</p>
              <button type="button" className={styles.retryButton} onClick={onSubscribe}>다시 시도</button>
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor={inputId} className={styles.label}>목표 가격</label>
                <div className={`${styles.inputBox} ${fieldError ? styles.inputInvalid : ''}`}>
                  <input
                    id={inputId}
                    className={styles.input}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="예: 25,000"
                    value={targetInput}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={`${inputId}-help`}
                    onChange={(event) => {
                      setTargetInput(event.target.value);
                      setFieldError(null);
                    }}
                  />
                  <span className={styles.unit}>원</span>
                </div>
                <p id={`${inputId}-help`} className={fieldError ? styles.error : styles.hint}>
                  {fieldError ?? `현재가 ${product.salePrice.toLocaleString('ko-KR')}원보다 낮은 가격으로 설정합니다. 비워 두면 목표 가격 없이 알림만 받습니다.`}
                </p>
              </div>

              <div className={styles.toggleRow}>
                <span>
                  가격 하락 알림
                  <small className={styles.toggleHelp}>지금보다 가격이 내려가면 알려드립니다</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={priceDrop}
                  aria-label="가격 하락 알림"
                  className={styles.switch}
                  onClick={() => setPriceDrop((previous) => !previous)}
                />
              </div>

              <div className={styles.toggleRow}>
                <span>
                  재입고 알림
                  <small className={styles.toggleHelp}>품절된 상품이 다시 들어오면 알려드립니다</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={restock}
                  aria-label="재입고 알림"
                  className={styles.switch}
                  onClick={() => setRestock((previous) => !previous)}
                />
              </div>

              <div className={styles.footer}>
                <p
                  className={`${styles.notice} ${notice.kind === 'saved' ? styles.noticeSaved : ''} ${notice.kind === 'error' ? styles.noticeError : ''}`}
                  role="status"
                >
                  {notice.text}
                </p>
                <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
