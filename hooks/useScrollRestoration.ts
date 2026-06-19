/**
 * hooks/useScrollRestoration.ts - 스크롤 위치 복원 커스텀 훅 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 상품 카드를 클릭해서 상세 페이지로 이동했다가 뒤로 가기를 누르면
 * 이전 스크롤 위치로 자동 복원합니다.
 *
 * 예시:
 * 1. 사용자가 목록을 스크롤해서 50번째 상품을 봄
 * 2. 그 상품을 클릭 → 상세 페이지로 이동
 * 3. 뒤로 가기 클릭 → 목록 페이지로 돌아옴
 * 4. 이 훅 없으면: 페이지 최상단으로 이동 (불편함)
 * 5. 이 훅 있으면: 50번째 상품 위치로 자동 스크롤 복원 (UX 개선)
 *
 * ═══════════════════════════════════════════════════════════════
 * SPA(Single Page Application)에서 라우팅이란?
 * ═══════════════════════════════════════════════════════════════
 * Next.js는 SPA입니다. 페이지 이동 시 실제로 전체 HTML을 새로 받지 않고
 * JavaScript로 URL과 컴포넌트만 바꿉니다.
 * → 브라우저의 기본 뒤로 가기 스크롤 복원이 작동하지 않습니다.
 * → 이 훅이 직접 스크롤 위치를 저장하고 복원합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * sessionStorage란?
 * ═══════════════════════════════════════════════════════════════
 * localStorage와 비슷하지만, 탭을 닫으면 데이터가 사라집니다.
 * 스크롤 위치는 영구 저장이 필요 없으므로 sessionStorage가 적합합니다.
 *
 * TypeScript 문법 포인트:
 * - interface: 객체 구조 정의 (x, y 좌표)
 * - void: 반환값이 없는 함수 타입
 * - as ScrollPosition: 타입 단언(Type Assertion) — "이 값은 ScrollPosition 타입이다"
 */

// useEffect: 컴포넌트가 마운트될 때 라우터 이벤트 리스너를 등록합니다.
import { useEffect } from 'react';

// useRouter: Next.js의 라우터 훅
// router.events: 라우팅 시작/완료 등의 이벤트를 감지합니다.
// router.asPath: 현재 URL 경로 (쿼리스트링 포함, 예: '/product/123?ref=home')
import { useRouter } from 'next/router';

/**
 * ScrollPosition - 스크롤 위치를 저장하는 데이터 구조
 *
 * x: 수평 스크롤 위치 (픽셀)
 * y: 수직 스크롤 위치 (픽셀)
 *
 * 예: { x: 0, y: 1200 } → 세로 1200px 스크롤된 위치
 *
 * Java 비유: public record ScrollPosition(int x, int y) {}
 */
interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * useScrollRestoration - 스크롤 위치를 자동 저장/복원하는 커스텀 훅
 *
 * (): void
 * - 인자 없음: 설정 값이 필요 없습니다.
 * - void: 아무것도 반환하지 않습니다. 사이드 이펙트(이벤트 등록)만 합니다.
 *
 * 사용법 (pages/_app.tsx 또는 특정 페이지에서):
 * function MyPage() {
 *   useScrollRestoration(); // 이 한 줄로 스크롤 복원 기능을 추가
 *   return <div>...</div>;
 * }
 */
export default function useScrollRestoration(): void {
  // useRouter(): 현재 라우터 인스턴스를 가져옵니다.
  // router.events: Next.js 라우터의 이벤트 에미터
  const router = useRouter();

  /**
   * useEffect — 라우터 이벤트 리스너 등록/해제
   *
   * 의존성 배열: [router]
   * → router 객체가 바뀔 때만 Effect를 다시 실행합니다.
   * (실제로 router는 거의 바뀌지 않으므로 처음 한 번만 실행됩니다)
   *
   * cleanup 함수: return () => { router.events.off(...) }
   * → 컴포넌트가 unmount될 때 이벤트 리스너를 제거합니다.
   * → 메모리 누수를 방지합니다.
   * Java 비유: @PreDestroy void cleanup() { eventBus.unregister(this); }
   */
  useEffect(() => {
    /**
     * saveScrollPos - 페이지 이동 전 현재 스크롤 위치를 저장하는 함수
     *
     * routeChangeStart 이벤트: 페이지 이동이 시작될 때 발생합니다.
     * 이 시점에 현재 스크롤 위치를 sessionStorage에 저장합니다.
     *
     * window.scrollX: 현재 수평 스크롤 위치(픽셀)
     * window.scrollY: 현재 수직 스크롤 위치(픽셀)
     *
     * `scrollPos:${router.asPath}`: 저장 키 — 경로별로 다른 키를 사용합니다.
     * 예: 'scrollPos:/' → 메인 페이지의 스크롤 위치
     *     'scrollPos:/product/123' → 상품 상세 페이지의 스크롤 위치
     *
     * JSON.stringify(): 객체를 JSON 문자열로 변환합니다.
     * { x: 0, y: 1200 } → '{"x":0,"y":1200}'
     * sessionStorage는 문자열만 저장할 수 있으므로 직렬화가 필요합니다.
     */
    const saveScrollPos = (): void => {
      const scrollPos: ScrollPosition = { x: window.scrollX, y: window.scrollY };
      sessionStorage.setItem(`scrollPos:${router.asPath}`, JSON.stringify(scrollPos));
    };

    /**
     * restoreScrollPos - 페이지 이동 후 이전 스크롤 위치를 복원하는 함수
     *
     * @param url - 이동이 완료된 URL 경로 (라우터 이벤트가 전달합니다)
     *
     * routeChangeComplete 이벤트: 페이지 이동이 완료되었을 때 발생합니다.
     * 이 시점에 sessionStorage에서 이전 스크롤 위치를 읽어 복원합니다.
     *
     * 왜 setTimeout을 사용하나요?
     * routeChangeComplete 이벤트 직후에는 아직 React가 새 페이지를 완전히 렌더하지 않았을 수 있습니다.
     * setTimeout(..., 100): 100ms 후에 스크롤을 복원하면 렌더 완료 후 안전하게 이동합니다.
     * Java의 Thread.sleep(100ms)와 유사하지만, 비동기라 실제로 멈추지는 않습니다.
     *
     * JSON.parse(scrollPos): JSON 문자열을 객체로 파싱합니다.
     * as ScrollPosition: TypeScript 타입 단언 — "이 값은 ScrollPosition 타입이다"
     *   JSON.parse()는 any 타입을 반환하므로 타입을 알려줍니다.
     *   Java의 (ScrollPosition) obj 형변환과 유사하지만, 런타임 체크는 없습니다.
     *
     * const { x, y } = ...: 구조 분해 할당 — 객체에서 x, y 필드를 꺼냅니다.
     * window.scrollTo(x, y): 지정된 좌표로 스크롤을 이동합니다.
     */
    const restoreScrollPos = (url: string): void => {
      const scrollPos = sessionStorage.getItem(`scrollPos:${url}`);
      if (scrollPos) {
        try {
          const { x, y } = JSON.parse(scrollPos) as ScrollPosition;
          // 렌더링이 완료된 후 스크롤하도록 약간 지연 (100ms)
          setTimeout(() => {
            window.scrollTo(x, y);
          }, 100);
        } catch {
          // JSON 파싱 오류 등이 발생해도 무시하고 진행
        }
      }
    };

    /**
     * 라우터 이벤트 리스너 등록
     *
     * router.events.on(이벤트명, 핸들러):
     * - 'routeChangeStart': URL 변경이 시작될 때 saveScrollPos 호출
     * - 'routeChangeComplete': URL 변경이 완료될 때 restoreScrollPos 호출
     *
     * Java 비유: eventBus.subscribe("routeChangeStart", saveScrollPos);
     */
    router.events.on('routeChangeStart', saveScrollPos);
    router.events.on('routeChangeComplete', restoreScrollPos);

    /**
     * cleanup 함수 — Effect가 다시 실행되거나 컴포넌트가 unmount될 때 호출
     *
     * router.events.off(이벤트명, 핸들러): 이벤트 리스너를 제거합니다.
     * 리스너를 제거하지 않으면 이미 사라진 컴포넌트에 이벤트가 전달되어
     * 메모리 누수 또는 오류가 발생할 수 있습니다.
     *
     * Java 비유: @PreDestroy void cleanup() {
     *   eventBus.unsubscribe("routeChangeStart", saveScrollPos);
     * }
     */
    return () => {
      router.events.off('routeChangeStart', saveScrollPos);
      router.events.off('routeChangeComplete', restoreScrollPos);
    };
  }, [router]); // router가 바뀔 때 Effect 재실행 (실제로는 거의 바뀌지 않음)
}
