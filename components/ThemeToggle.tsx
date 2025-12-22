import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import styles from '../styles/ThemeToggle.module.css';

/**
 * ThemeToggle
 * - 다크/라이트 테마를 토글하는 버튼입니다.
 * - next-themes 라이브러리를 사용합니다.
 */

export default function ThemeToggle() {
  // mounted는 "클라이언트에서만 렌더"를 보장하기 위한 상태입니다.
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect는 클라이언트에서만 실행되므로, SSR과의 불일치를 방지합니다.
  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 렌더링 단계에서는 아무것도 렌더하지 않음
  if (!mounted) {
    return null;
  }

  // 클릭 시 현재 테마를 반대로 토글
  return (
    <button
      className={styles.toggleButton}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
