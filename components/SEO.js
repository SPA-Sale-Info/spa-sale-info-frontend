/**
 * ============================================================================
 * SEO.js - 검색 엔진 최적화 컴포넌트
 * ============================================================================
 *
 * 🎯 이 컴포넌트의 역할:
 * 1. 페이지별 메타 태그 동적 생성
 * 2. 구조화된 데이터(JSON-LD) 추가로 검색 결과 개선
 * 3. Open Graph 및 Twitter Card 설정
 *
 * 📈 SEO 최적화 효과:
 * - 구글 검색 결과에서 더 풍부한 정보 표시 (Rich Snippet)
 * - 소셜 미디어 공유 시 예쁜 카드 형태로 표시
 * - 검색 순위(랭킹) 향상
 *
 * Spring Boot 비유:
 * - @Controller에서 Model에 메타 정보 추가하는 것과 비슷
 * - 하지만 프론트엔드에서 직접 HTML <head>를 관리
 */

import Head from 'next/head'

/**
 * SEO 컴포넌트
 *
 * @param {Object} props - SEO 설정 객체
 * @param {string} props.title - 페이지 제목
 * @param {string} props.description - 페이지 설명
 * @param {string} props.canonical - 표준 URL (중복 컨텐츠 방지)
 * @param {string} props.ogImage - Open Graph 이미지 URL
 * @param {string} props.ogType - Open Graph 타입 (website, article 등)
 * @param {Object} props.structuredData - JSON-LD 구조화된 데이터
 */
export default function SEO({
  title = 'Sale Archive - SPA 브랜드 세일 정보',
  description = 'H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 최신 세일 정보.',
  canonical = 'https://mion-spa-info.vercel.app',
  ogImage = 'https://mion-spa-info.vercel.app/og-image.png',
  ogType = 'website',
  structuredData = null,
}) {
  /**
   * ============================================================================
   * 기본 구조화된 데이터 (JSON-LD)
   * ============================================================================
   *
   * JSON-LD란?
   * - JSON for Linking Data
   * - 검색 엔진이 페이지 내용을 더 잘 이해하도록 돕는 구조화된 데이터
   * - 구글 검색 결과에 별점, 가격, 재고 등을 표시 (Rich Snippet)
   *
   * Spring Boot 비유:
   * - REST API의 JSON 응답과 비슷한 형식
   * - 하지만 검색 엔진용 메타데이터
   */
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
  }

  /**
   * 전달받은 구조화된 데이터가 있으면 사용, 없으면 기본값 사용
   * JavaScript의 || 연산자: 왼쪽이 falsy면 오른쪽 사용
   */
  const finalStructuredData = structuredData || defaultStructuredData

  return (
    <Head>
      {/* ========================================================================
          기본 메타 태그
          ======================================================================== */}

      {/* 페이지 제목 - 브라우저 탭에 표시됨 */}
      <title>{title}</title>

      {/* 페이지 설명 - 구글 검색 결과에 표시됨 (최대 160자 권장) */}
      <meta name="description" content={description} />

      {/* 키워드 - 예전 방식이지만 하위 호환성을 위해 유지 */}
      <meta
        name="keywords"
        content="SPA 브랜드, 할인, 세일, H&M, ZARA, UNIQLO, MUJI, 찰스앤키스, 패션, 쇼핑, 가격비교"
      />

      {/* ========================================================================
          표준 URL (Canonical URL)
          ======================================================================== */}
      {/*
        중복 컨텐츠 방지용 태그
        - 같은 내용이 여러 URL에 있을 때 "진짜" URL을 지정
        - 예: ?utm_source=facebook 같은 파라미터가 붙어도 원본 URL로 인식
        - SEO 점수 분산 방지
      */}
      <link rel="canonical" href={canonical} />

      {/* ========================================================================
          Open Graph 메타 태그 (페이스북, 카카오톡 등 소셜 미디어용)
          ======================================================================== */}
      {/*
        Open Graph Protocol:
        - 소셜 미디어에서 링크 공유 시 예쁜 카드 형태로 표시
        - 페이스북, 카카오톡, 슬랙 등에서 지원
      */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Sale Archive" />
      <meta property="og:locale" content="ko_KR" />

      {/* ========================================================================
          Twitter Card 메타 태그 (트위터/X 전용)
          ======================================================================== */}
      {/*
        Twitter Card:
        - 트위터(X)에서 링크 공유 시 카드 형태로 표시
        - summary_large_image: 큰 이미지가 있는 카드
      */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ========================================================================
          검색 엔진 크롤링 제어
          ======================================================================== */}
      {/*
        robots 메타 태그:
        - index: 검색 결과에 포함 허용
        - follow: 페이지 내 링크 따라가기 허용
        - noindex: 검색 결과에서 제외
        - nofollow: 링크 따라가지 않음
      */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />

      {/* ========================================================================
          모바일 최적화
          ======================================================================== */}
      {/*
        모바일 친화적 사이트임을 알림
        - 모바일 검색 순위에 영향
      */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* ========================================================================
          JSON-LD 구조화된 데이터
          ======================================================================== */}
      {/*
        JSON-LD (JavaScript Object Notation for Linked Data):
        - 검색 엔진이 페이지 내용을 구조적으로 이해
        - 구글 검색 결과에 리치 스니펫(별점, 가격 등) 표시
        - type="application/ld+json": 이 스크립트가 JSON-LD임을 명시

        예시 효과:
        - 상품 검색 시 가격, 재고, 별점이 검색 결과에 바로 표시
        - 회사 정보 검색 시 로고, 연락처 등 추가 정보 표시
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData),
        }}
      />
    </Head>
  )
}

/**
 * ============================================================================
 * 사용 예시
 * ============================================================================
 *
 * // 기본 사용 (메인 페이지)
 * <SEO />
 *
 * // 커스텀 타이틀과 설명
 * <SEO
 *   title="H&M 세일 상품 | Sale Archive"
 *   description="H&M의 최신 할인 상품을 확인하세요"
 *   canonical="https://mion-spa-info.vercel.app/brands/hm"
 * />
 *
 * // 상품 상세 페이지용 구조화된 데이터
 * const productStructuredData = {
 *   '@context': 'https://schema.org',
 *   '@type': 'Product',
 *   name: '오버사이즈 셔츠',
 *   image: 'https://image.hm.com/...',
 *   description: '편안한 오버사이즈 핏의 셔츠',
 *   brand: {
 *     '@type': 'Brand',
 *     name: 'H&M'
 *   },
 *   offers: {
 *     '@type': 'Offer',
 *     price: '29900',
 *     priceCurrency: 'KRW',
 *     availability: 'https://schema.org/InStock'
 *   }
 * }
 *
 * <SEO
 *   title="오버사이즈 셔츠 - H&M"
 *   structuredData={productStructuredData}
 * />
 */
