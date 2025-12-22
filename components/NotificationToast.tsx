import { useEffect, useState } from 'react';
import styles from '../styles/NotificationToast.module.css';

// props 타입: 부모가 전달할 메시지/보이기 여부/닫기 콜백
interface NotificationToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 알림 토스트 컴포넌트 (TypeScript 버전)
 */
export default function NotificationToast({ message, isVisible, onClose }: NotificationToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  /**
   * isVisible이 true/false로 바뀔 때마다 렌더링 상태를 조절합니다.
   * - true: 바로 보여주고 4초 뒤 자동 닫기
   * - false: 애니메이션을 위해 잠시 유지 후 언마운트
   */
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.toast} ${isVisible ? styles.visible : ''} `}>
      <div className={styles.icon}>🔔</div>
      <div className={styles.content}>{message}</div>
      <button className={styles.close} onClick={onClose}>
        ×
      </button>
    </div>
  );
}
