/**
 * _document.tsx - HTML 문서의 구조를 정의하는 파일 (TypeScript 버전)
 *
 * Next.js에서 <html>, <head>, <body> 구조를 커스터마이징할 때 사용합니다.
 * 일반 페이지 컴포넌트와 달리 서버에서 한 번 렌더됩니다.
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* Pretendard Variable — Framer 시안과 동일한 가변 폰트
            dynamic-subset: 한글 글리프를 조각으로 나눠 쓰는 글자만 내려받아 초기 로딩이 가볍습니다.
            preconnect로 DNS·TCP 연결을 미리 수행해 폰트 로딩 지연 최소화 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />

        {/* 문서 공통 메타 태그 */}
        <meta charSet="utf-8" />

        {/* PWA 설정 */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="ARCA" />

        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-6853743390551388" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6853743390551388"
          crossOrigin="anonymous"
        />

        {/* 파비콘 설정 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
