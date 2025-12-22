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
        {/* SEO 기본 메타 태그 */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta
          name="description"
          content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 세일 정보로 스마트한 쇼핑을 경험하세요."
        />
        <meta
          name="keywords"
          content="SPA 브랜드, 할인, 세일, H&M, ZARA, UNIQLO, MUJI, 찰스앤키스, Charles & Keith, 패션, 쇼핑, 가격비교, 세일정보, 온라인쇼핑, 세일모음, 패션할인, 의류세일"
        />
        <meta name="author" content="Sale Archive" />
        <meta
          name="google-site-verification"
          content="_KMcFZsQnyR0XLtsW2dKq3pk7zUzyWhA9ocxFf5TYHY"
        />

        {/* PWA 설정 */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sale Archive" />

        {/* 추가 SEO 메타 태그 */}
        <meta name="language" content="Korean" />
        <meta httpEquiv="content-language" content="ko-KR" />
        <meta name="geo.region" content="KR" />
        <meta name="geo.placename" content="South Korea" />

        {/* Open Graph 태그 (SNS 공유용) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Sale Archive" />
        <meta property="og:title" content="Sale Archive - SPA 브랜드 세일 정보" />
        <meta
          property="og:description"
          content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요."
        />
        <meta property="og:url" content="https://mion-spa-info.vercel.app" />
        <meta property="og:locale" content="ko_KR" />

        {/* Twitter Card 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sale Archive - SPA 브랜드 세일 정보" />
        <meta
          name="twitter:description"
          content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요."
        />

        {/* 검색엔진 크롤링 설정 */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="bingbot" content="index, follow" />
        <meta name="yeti" content="index, follow" />

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
        <link rel="canonical" href="https://mion-spa-info.vercel.app" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
