/**
 * components/NotificationBell.tsx - 알림함으로 가는 종 아이콘
 *
 * 읽지 않은 알림이 있으면 개수를 옆에 모노 숫자로 보여줍니다. Ledger 규칙상 빨강은 인하폭 전용이고
 * 배지를 남발하지 않으므로, 찜 개수와 같은 방식(숫자만)으로 표시합니다.
 *
 * localStorage를 쓸 수 없는 브라우저에서는 알림 기능이 없으므로 아무것도 그리지 않습니다.
 */

import Link from 'next/link';
import styles from '../styles/NotificationBell.module.css';
import useUnreadCount from '../hooks/useUnreadCount';

export default function NotificationBell() {
  const { count, available } = useUnreadCount();

  if (!available) {
    return null;
  }

  const label = count > 0 ? `알림, 읽지 않은 알림 ${count}개` : '알림';
  return (
    <Link href="/notifications" className={styles.bell} aria-label={label}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" strokeLinejoin="round" />
        <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
      </svg>
      {count > 0 && <span className={styles.count}>{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
