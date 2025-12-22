/**
 * SEO.tsx - 검색 엔진 최적화 컴포넌트 (TypeScript 버전)
 *
 * <Head> 태그 안에 메타 정보를 넣어 검색 노출과 공유 미리보기를 개선합니다.
 * TypeScript 문법 포인트:
 * - props에 기본값을 지정하여 "값이 없을 때 기본값"을 사용합니다.
 * - Record<string, any>는 "키가 문자열이고 값이 어떤 타입이든" 가능한 객체입니다.
 */

import Head from 'next/head';

// 컴포넌트가 받을 수 있는 props 타입
interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: Record<string, any> | null;
}

/**
 * SEO 컴포넌트
 */
export default function SEO({
  title = 'Sale Archive - SPA 브랜드 세일 정보',
  description = 'H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 최신 세일 정보.',
  canonical = 'https://mion-spa-info.vercel.app',
  ogImage = 'https://mion-spa-info.vercel.app/og-image.png',
  ogType = 'website',
  structuredData = null,
}: SEOProps) {
  // 기본 구조화 데이터(JSON-LD)
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sale Archive',
    description: 'SPA 브랜드 세일 정보 모음',
    url: 'https://mion-spa-info.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mion-spa-info.vercel.app/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sale Archive',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mion-spa-info.vercel.app/favicon.svg',
      },
    },
  };

  // 외부에서 structuredData가 들어오면 그것을 우선 사용
  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Head>
      {/* 기본 메타 태그 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="SPA 브랜드, 할인, 세일, H&M, ZARA, UNIQLO, MUJI, 찰스앤키스, 패션, 쇼핑, 가격비교"
      />

      {/* 표준 URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph 메타 태그 */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Sale Archive" />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card 메타 태그 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* 검색 엔진 크롤링 제어 */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />

      {/* 모바일 최적화 */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* JSON-LD 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData),
        }}
      />
    </Head>
  );
}
