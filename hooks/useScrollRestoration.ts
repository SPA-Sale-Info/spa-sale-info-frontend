/**
 * useScrollRestoration.ts
 *
 * 스크롤 위치 복원 훅 (TypeScript 버전)
 *
 * TypeScript 문법 포인트:
 * - interface로 객체 구조를 명확히 정의합니다.
 * - 함수 반환 타입을 `void`로 명시하면 반환값이 없다는 뜻입니다.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

// 스크롤 위치 타입 (x, y 좌표)
interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * 스크롤 위치 복원 훅
 *
 * Next.js의 페이지 이동 시 스크롤 위치가 유지되지 않는 문제를 해결합니다.
 */
// 커스텀 훅 본체
export default function useScrollRestoration(): void {
  const router = useRouter();

  useEffect(() => {
    /**
     * 스크롤 위치 저장 함수
     * 현재 페이지 경로를 키로 하여 sessionStorage에 저장합니다.
     */
    const saveScrollPos = (): void => {
      const scrollPos: ScrollPosition = { x: window.scrollX, y: window.scrollY };
      sessionStorage.setItem(`scrollPos:${router.asPath}`, JSON.stringify(scrollPos));
    };

    /**
     * 스크롤 위치 복원 함수
     * 라우팅 완료 시 이전 위치로 스크롤합니다.
     */
    const restoreScrollPos = (url: string): void => {
      const scrollPos = sessionStorage.getItem(`scrollPos:${url}`);
      if (scrollPos) {
        try {
          const { x, y } = JSON.parse(scrollPos) as ScrollPosition;
          // 렌더링이 끝난 후 스크롤하도록 약간 지연
          setTimeout(() => {
            window.scrollTo(x, y);
          }, 100);
        } catch {}
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
