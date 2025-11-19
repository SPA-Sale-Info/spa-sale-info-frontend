/**
 * _document.js - HTML 문서의 구조를 정의하는 파일
 *
 * 이 파일은 서버에서만 렌더링되며, HTML의 <html>, <head>, <body> 태그를 커스터마이징합니다.
 *
 * 왜 필요한가요?
 * - 웹 폰트 추가
 * - 메타 태그 설정
 * - 전역 스크립트 추가
 * - 언어 설정 등
 *
 * 주의사항:
 * - 이 파일은 서버에서만 실행되므로, onClick 같은 이벤트 핸들러는 작동하지 않습니다
 * - 애플리케이션 로직은 _app.js나 각 페이지에 작성해야 합니다
 */

// Next.js에서 제공하는 Document 관련 컴포넌트들을 import 합니다
import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Document 컴포넌트
 *
 * HTML 문서의 기본 구조를 정의합니다
 */
export default function Document() {
  return (
    /**
     * <Html> 태그
     * - HTML의 최상위 태그입니다
     * - lang="ko"는 웹사이트의 주 언어가 한국어임을 나타냅니다
     * - 스크린 리더와 검색 엔진이 이 정보를 활용합니다
     */
    <Html lang="ko">
      {/**
       * <Head> 태그
       * - HTML의 <head> 부분을 정의합니다
       * - 메타데이터, 폰트, 파비콘 등을 여기에 추가합니다
       *
       * 주의: 이것은 HTML의 <head>이고, next/head와는 다릅니다
       * - next/head는 각 페이지에서 동적으로 head를 수정할 때 사용
       * - _document.js의 Head는 모든 페이지에 공통으로 적용
       */}
      <Head>
        {/* SEO 기본 메타 태그 */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 세일 정보로 스마트한 쇼핑을 경험하세요." />
        <meta name="keywords" content="SPA 브랜드, 할인, 세일, H&M, ZARA, UNIQLO, MUJI, 찰스앤키스, Charles & Keith, 패션, 쇼핑, 가격비교, 세일정보, 온라인쇼핑, 세일모음, 패션할인, 의류세일" />
        <meta name="author" content="Sale Archive" />
        <meta name="theme-color" content="#FF6B6B" />

        {/* 추가 SEO 메타 태그 */}
        <meta name="language" content="Korean" />
        <meta httpEquiv="content-language" content="ko-KR" />
        <meta name="geo.region" content="KR" />
        <meta name="geo.placename" content="South Korea" />

        {/* Open Graph 태그 (SNS 공유용) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Sale Archive" />
        <meta property="og:title" content="Sale Archive - SPA 브랜드 세일 정보" />
        <meta property="og:description" content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요." />
        <meta property="og:url" content="https://mion-spa-info.vercel.app" />
        <meta property="og:locale" content="ko_KR" />

        {/* Twitter Card 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sale Archive - SPA 브랜드 세일 정보" />
        <meta name="twitter:description" content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요." />

        {/* 검색엔진 크롤링 설정 */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow" />
        <meta name="yeti" content="index, follow" /> {/* 네이버 검색 봇 */}

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
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href="https://mion-spa-info.vercel.app" />
      </Head>

      {/**
       * <body> 태그
       * - HTML의 <body> 부분을 정의합니다
       * - 실제 콘텐츠가 렌더링되는 영역입니다
       */}
      <body>
        {/**
         * <Main /> 컴포넌트
         * - Next.js가 렌더링한 페이지 컨텐츠가 여기에 삽입됩니다
         * - 반드시 포함되어야 합니다
         */}
        <Main />

        {/**
         * <NextScript /> 컴포넌트
         * - Next.js가 필요로 하는 스크립트들을 자동으로 삽입합니다
         * - React를 실행하는 스크립트, 페이지 간 이동을 위한 스크립트 등
         * - 반드시 포함되어야 합니다
         */}
        <NextScript />
      </body>
    </Html>
  )
}
