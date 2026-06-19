/**
 * _app.tsx - Next.js 앱의 최상위(루트) 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 모든 페이지를 감싸는 공통 레이아웃이자 앱의 진입점입니다.
 *
 * Next.js는 pages/ 폴더의 파일들을 URL 경로로 자동 변환합니다:
 *   pages/index.tsx   → http://localhost:3000/
 *   pages/about.tsx   → http://localhost:3000/about
 *   pages/product/[id].tsx → http://localhost:3000/product/123
 *
 * 이 _app.tsx는 모든 페이지를 "감싸는 외부 껍데기" 역할을 합니다.
 * 페이지가 바뀌어도 이 파일의 코드는 계속 살아있습니다.
 *
 * Java/Spring 비유:
 * - Spring의 DispatcherServlet + 공통 필터/인터셉터와 비슷합니다.
 * - 모든 요청이 반드시 거쳐가는 공통 처리 지점입니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 📁 Next.js 특수 파일들 (이름이 정해져 있음)
 * ═══════════════════════════════════════════════════════════════
 * _app.tsx     → 모든 페이지를 감싸는 루트 컴포넌트 (이 파일)
 * _document.tsx → HTML 문서 구조 커스터마이징 (<html lang>, <head>, <body>)
 * pages/*.tsx   → 각각 독립적인 URL 경로가 되는 페이지들
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - import type: "타입 정보만" 가져옵니다. 런타임 코드(JavaScript)에는 영향이 없습니다.
 *   컴파일 후 사라지는 타입 선언 전용 import입니다.
 * - AppProps: Next.js가 제공하는 타입으로, { Component, pageProps } 구조를 정의합니다.
 */

// 전역 CSS 파일 import — 모든 페이지에 공통으로 적용되는 스타일
// (CSS 변수, 리셋, 폰트, 다크모드 변수 등)
import '../styles/globals.css';

// next-themes: 다크/라이트 테마를 관리하는 라이브러리
// ThemeProvider는 하위 컴포넌트 전체에 테마 컨텍스트(Context)를 제공합니다.
// 컨텍스트(Context): React에서 props를 일일이 내려주지 않고 전역으로 값을 공유하는 메커니즘
// Java/Spring 비유: ApplicationContext (전역 빈 저장소)
import { ThemeProvider } from 'next-themes';

// useEffect: 컴포넌트가 화면에 나타난 후 실행할 코드를 등록하는 React 훅
// 클라이언트(브라우저)에서만 실행됩니다 — 서버에서는 실행되지 않습니다.
import { useEffect } from 'react';

// Footer: 모든 페이지 하단에 공통으로 표시할 푸터 컴포넌트
import Footer from '../components/Footer';

// import type: 타입 정보만 가져옵니다. 빌드된 JS에는 포함되지 않습니다.
// AppProps: { Component: React 컴포넌트, pageProps: 객체 } 구조를 정의
import type { AppProps } from 'next/app';

// @vercel/analytics: Vercel 플랫폼에서 제공하는 방문자 분석 컴포넌트
// 화면에 아무것도 표시하지 않고, 백그라운드에서 방문 데이터를 수집합니다.
import { Analytics } from '@vercel/analytics/next';

/**
 * MyApp 컴포넌트
 *
 * 이름은 자유롭게 지을 수 있지만, export default로 내보내야 합니다.
 * Next.js가 이 파일에서 export default된 컴포넌트를 루트 컴포넌트로 사용합니다.
 *
 * props 구조 분해 할당(Destructuring):
 *   function MyApp({ Component, pageProps }: AppProps)
 *   → AppProps 타입의 객체에서 Component와 pageProps를 꺼냅니다.
 *   → Java: AppProps props를 받아서 props.getComponent(), props.getPageProps() 하는 것과 유사
 *
 * - Component: 현재 URL에 해당하는 페이지 컴포넌트 (예: pages/index.tsx의 Home 함수)
 * - pageProps: 해당 페이지의 getServerSideProps 또는 getStaticProps가 반환한 데이터
 */
function MyApp({ Component, pageProps }: AppProps) {
  /**
   * PWA(Progressive Web App) 서비스 워커 등록
   * ─────────────────────────────────────────────────────────
   * 서비스 워커(Service Worker)란?
   * - 브라우저 백그라운드에서 실행되는 JavaScript 파일입니다.
   * - 네트워크 요청을 가로채서 오프라인에서도 앱이 동작하게 합니다.
   * - 앱을 스마트폰 홈 화면에 "설치"할 수 있는 PWA 기능을 제공합니다.
   * - public/sw.js 파일이 서비스 워커의 실제 로직을 담당합니다.
   *
   * useEffect(() => { ... }, [])
   * - 두 번째 인자: 의존성 배열(dependency array)
   * - 빈 배열([]) = "아무 상태도 의존하지 않음" = 컴포넌트 최초 렌더 시 딱 한 번만 실행
   * - 클라이언트에서만 실행 (서버 렌더링 때는 실행되지 않음)
   *
   * 'serviceWorker' in navigator:
   * - navigator 객체에 'serviceWorker' 속성이 있는지 확인합니다.
   * - 오래된 브라우저는 서비스 워커를 지원하지 않으므로 체크가 필요합니다.
   * - Java의 instanceof 체크와 비슷합니다.
   *
   * window.addEventListener('load', () => { ... }):
   * - 페이지의 모든 리소스(이미지, 폰트 등)가 로드된 후에 서비스 워커를 등록합니다.
   * - 서비스 워커 등록이 초기 페이지 로딩을 방해하지 않도록 하기 위함입니다.
   *
   * navigator.serviceWorker.register('/sw.js').catch(() => {}):
   * - /sw.js(= public/sw.js)를 서비스 워커로 등록합니다.
   * - .catch(() => {}): 등록에 실패해도 앱이 정상 동작하도록 에러를 무시합니다.
   *   (PWA 기능은 "있으면 좋지만 없어도 되는" 점진적 향상(Progressive Enhancement)입니다.)
   *
   * Java/Spring 비유:
   * @EventListener(ApplicationReadyEvent.class)
   * public void onAppReady() { registerServiceWorker(); }
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []); // 빈 배열 = 마운트 시 딱 한 번만 실행

  /**
   * JSX 반환 — 모든 페이지를 감싸는 컴포넌트 트리
   * ─────────────────────────────────────────────────────────
   * JSX(JavaScript XML): HTML처럼 생겼지만 실제로는 JavaScript입니다.
   * 브라우저는 JSX를 이해하지 못하므로, Babel이 React.createElement() 함수 호출로 변환합니다.
   *
   * <ThemeProvider attribute="data-theme">
   * - attribute="data-theme": ThemeProvider가 HTML <html> 태그에 data-theme 속성을 붙입니다.
   *   라이트 모드: <html data-theme="light">
   *   다크 모드:  <html data-theme="dark">
   * - globals.css에서 [data-theme="dark"] { --bg-color: #000; } 처럼 테마별 색상을 정의합니다.
   * - React Context API를 내부적으로 사용합니다 — 모든 하위 컴포넌트가 테마 정보에 접근 가능.
   *
   * <Component {...pageProps} />
   * - Component: 현재 URL에 해당하는 페이지 컴포넌트입니다.
   *   예: '/' 경로 → pages/index.tsx의 Home 컴포넌트
   *       '/about' 경로 → pages/about.tsx의 About 컴포넌트
   * - {...pageProps}: 스프레드 연산자(...)로 pageProps 객체의 모든 필드를 props로 전달합니다.
   *   { a: 1, b: 2 }를 {...{a:1, b:2}} 처럼 풀어쓰는 것입니다.
   *   Java 비유: 메서드에 가변 인자(varargs)로 전달하는 것과 유사
   *
   * <Analytics />
   * - Vercel이 제공하는 방문자 분석 컴포넌트입니다.
   * - 화면에 아무것도 표시하지 않고 백그라운드에서 방문 데이터를 수집합니다.
   *
   * <Footer />
   * - components/Footer.tsx에서 가져온 공통 푸터 컴포넌트입니다.
   * - 모든 페이지 하단에 항상 표시됩니다.
   * - 페이지가 바뀌어도 사라지지 않습니다 (SPA의 특성).
   */
  return (
    <ThemeProvider attribute="data-theme">
      <Component {...pageProps} />
      <Analytics />
      <Footer />
    </ThemeProvider>
  );
}

/**
 * export default: 이 컴포넌트를 "기본 내보내기"로 선언합니다.
 * Next.js는 _app.tsx에서 export default된 컴포넌트를 자동으로 루트 컴포넌트로 사용합니다.
 *
 * ES Module(ES6) 방식:     export default MyApp
 * CommonJS(Node.js) 방식:  module.exports = MyApp
 * → 이 프로젝트는 ES Module 방식을 사용합니다.
 */
export default MyApp;
