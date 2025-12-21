import { useEffect, useState } from 'react';
import styles from '../styles/NotificationToast.module.css';

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
