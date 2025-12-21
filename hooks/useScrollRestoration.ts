/**
 * useScrollRestoration.ts
 *
 * 스크롤 위치 복원 훅 (TypeScript 버전)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

// 스크롤 위치 타입
interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * 스크롤 위치 복원 훅
 *
 * Next.js의 페이지 이동 시 스크롤 위치가 유지되지 않는 문제를 해결합니다.
 */
export default function useScrollRestoration(): void {
  const router = useRouter();

  useEffect(() => {
    /**
     * 스크롤 위치 저장 함수
     */
    const saveScrollPos = (): void => {
      const scrollPos: ScrollPosition = { x: window.scrollX, y: window.scrollY };
      sessionStorage.setItem(`scrollPos:${router.asPath}`, JSON.stringify(scrollPos));
    };

    /**
     * 스크롤 위치 복원 함수
     */
    const restoreScrollPos = (url: string): void => {
      const scrollPos = sessionStorage.getItem(`scrollPos:${url}`);
      if (scrollPos) {
        try {
          const { x, y } = JSON.parse(scrollPos) as ScrollPosition;
          setTimeout(() => {
            window.scrollTo(x, y);
          }, 100);
        } catch (e) {
          console.error('스크롤 복원 실패:', e);
        }
      }
    };

    // Next.js 라우터 이벤트 리스너 등록
    router.events.on('routeChangeStart', saveScrollPos);
    router.events.on('routeChangeComplete', restoreScrollPos);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      router.events.off('routeChangeStart', saveScrollPos);
      router.events.off('routeChangeComplete', restoreScrollPos);
    };
  }, [router]);
}
