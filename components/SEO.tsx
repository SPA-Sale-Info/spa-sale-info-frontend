/**
 * SEO.tsx - 검색 엔진 최적화(SEO) 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * HTML <head> 태그 안에 SEO 관련 메타 정보를 삽입합니다.
 * 검색 결과 노출 최적화와 소셜 미디어 공유 미리보기를 담당합니다.
 *
 * 삽입되는 정보:
 * - <title>: 브라우저 탭과 검색 결과에 표시되는 페이지 제목
 * - <meta name="description">: 검색 결과에 표시되는 짧은 설명
 * - Open Graph (og:*): 카카오톡, 페이스북 공유 시 미리보기 카드
 * - Twitter Card: 트위터 공유 미리보기
 * - JSON-LD 구조화 데이터: 검색 엔진이 이해하는 구조화된 정보
 *
 * ═══════════════════════════════════════════════════════════════
 * SEO(Search Engine Optimization)란?
 * ═══════════════════════════════════════════════════════════════
 * 검색 엔진(Google, Naver 등)에서 웹사이트가 더 잘 노출되도록 최적화하는 작업입니다.
 * 검색 엔진 봇(크롤러)은 HTML의 <head> 메타 태그를 읽어 페이지를 분석합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * Open Graph(OG)란?
 * ═══════════════════════════════════════════════════════════════
 * 소셜 미디어에서 링크 공유 시 미리보기 카드를 생성하는 프로토콜입니다.
 * 카카오톡, 페이스북, 디스코드 등에서 링크를 붙여넣으면 보이는
 * 제목/설명/이미지 카드가 og: 메타 태그로 만들어집니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * JSON-LD 구조화 데이터란?
 * ═══════════════════════════════════════════════════════════════
 * 검색 엔진이 페이지 내용을 더 정확하게 이해하도록 돕는 데이터 형식입니다.
 * schema.org 표준을 따르며, <script type="application/ld+json">으로 삽입합니다.
 * 구글 검색 결과에서 "리치 스니펫"(별점, 가격 등의 추가 정보)이 표시되게 합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - interface props의 기본값: function SEO({ title = 'ARCA ...' })
 * - Record<string, unknown>: "키가 string, 값은 직렬화 전까지 구체화하지 않는 객체"를 나타내는 TypeScript 유틸리티 타입
 * - structuredData || defaultStructuredData: null 폴백 (nullish coalescing 대신 OR 연산자)
 * - dangerouslySetInnerHTML: React에서 HTML 문자열을 직접 삽입하는 방법 (XSS 주의)
 */

// Head: Next.js가 제공하는 특수 컴포넌트
// 이 컴포넌트 안에 작성한 요소들이 HTML의 <head> 섹션에 삽입됩니다.
// React는 기본적으로 <body> 안에만 렌더링하지만, Next.js Head를 쓰면 <head>에도 삽입 가능합니다.
import Head from 'next/head';

/**
 * SEOProps - 이 컴포넌트가 받는 props 구조
 *
 * 모든 필드가 optional (?:)입니다:
 * - 값이 전달되지 않으면 컴포넌트 파라미터의 기본값(= ...)이 사용됩니다.
 * - 이렇게 하면 <SEO />만 써도 기본 SEO 설정이 적용됩니다.
 *
 * title?: 페이지 제목 (기본: 'ARCA - SPA 브랜드 세일 정보')
 * description?: 페이지 설명 (기본: 긴 설명 문구)
 * canonical?: 표준 URL (기본: 프로덕션 URL) — 중복 콘텐츠를 하나의 URL로 지정
 * ogImage?: Open Graph 이미지 URL (기본: og-image.png)
 * ogType?: Open Graph 타입 (기본: 'website', 상품 페이지는 'product')
 * structuredData?: JSON-LD 구조화 데이터 (기본: 웹사이트 기본 스키마)
 *   Record<string, unknown> | Record<string, unknown>[] | null:
 *   - Record<string, unknown>: 키가 문자열이고 값은 렌더 직전에 JSON으로 직렬화되는 객체
 *   - null: 값이 없음 (기본 구조화 데이터가 사용됨)
 *   TypeScript 유틸리티 타입: Record<K, V>는 Java의 Map<K, V>와 유사합니다.
 */
interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  robots?: string;
  googleSiteVerification?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[] | null;
}

/**
 * SEO 컴포넌트
 *
 * 파라미터 기본값 문법:
 * { title = '기본값', description = '기본값', ... }
 * → props가 undefined이면 지정한 기본값을 사용합니다.
 * → Java에서는 불가능하지만, JavaScript/TypeScript에서는 파라미터에 기본값을 설정할 수 있습니다.
 * Java 비유: public void render(String title) { if (title == null) title = "ARCA..."; }
 *
 * 사용 예시 (pages/index.tsx):
 * <SEO /> // 기본값 사용
 *
 * 사용 예시 (pages/product/[id].tsx):
 * <SEO
 *   title={`${product.name} - ARCA`}
 *   description={product.description}
 *   ogImage={product.imageUrl}
 *   ogType="product"
 *   structuredData={productSchema}
 * />
 */
export default function SEO({
  title = 'ARCA - SPA 브랜드 세일 정보',
  description = 'H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 최신 세일 정보.',
  canonical = 'https://mion-spa-info.vercel.app',
  ogImage = 'https://mion-spa-info.vercel.app/og-image.png',
  ogType = 'website',
  keywords = 'SPA 브랜드, 할인, 세일, H&M, ZARA, UNIQLO, MUJI, 찰스앤키스, 패션, 쇼핑, 가격비교',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  googleSiteVerification,
  structuredData = null,
}: SEOProps) {
  /**
   * defaultStructuredData - 기본 JSON-LD 구조화 데이터
   *
   * schema.org의 WebSite 스키마를 사용합니다.
   * 구글 검색 결과에서 사이트 검색 기능(sitelinks search box)이 표시될 수 있습니다.
   *
   * '@context': 'https://schema.org': schema.org 표준을 사용한다는 선언
   * '@type': 'WebSite': 이 페이지가 웹사이트임을 명시
   * potentialAction: 사이트 내 검색 기능 정보 (구글이 검색 창을 결과에 직접 표시할 수 있음)
   * publisher: 게시자 정보 (조직명, 로고)
   *
   * 이 데이터는 JSON.stringify()로 문자열로 변환되어 <script> 태그에 삽입됩니다.
   */
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ARCA',
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
      name: 'ARCA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mion-spa-info.vercel.app/favicon.svg',
      },
    },
  };

  /**
   * finalStructuredData - 실제로 삽입할 구조화 데이터
   *
   * structuredData || defaultStructuredData:
   * - 외부에서 structuredData prop이 전달됐으면 그것을 사용합니다.
   *   (상품 상세 페이지에서 Product 스키마를 전달하는 경우)
   * - null이면 defaultStructuredData(기본 WebSite 스키마)를 사용합니다.
   *
   * ||: OR 연산자 — 왼쪽이 falsy(null, undefined, false, 0, '')이면 오른쪽을 사용합니다.
   * Java 비유: structuredData != null ? structuredData : defaultStructuredData
   */
  const finalStructuredData = structuredData || defaultStructuredData;
  const structuredDataItems = Array.isArray(finalStructuredData)
    ? finalStructuredData
    : [finalStructuredData];

  /**
   * JSX 반환 — HTML <head> 메타 태그들
   *
   * <Head>: Next.js의 Head 컴포넌트
   * - 이 안에 있는 태그들은 실제 HTML의 <head> 섹션에 삽입됩니다.
   * - 중복 태그는 자동으로 최신 것으로 교체됩니다 (예: 여러 곳에서 <title> 사용 시).
   */
  return (
    <Head>
      {/* ────────────────────────────────────────
          기본 메타 태그
          ──────────────────────────────────────── */}

      {/**
       * <title>: 브라우저 탭, 검색 결과 제목, 즐겨찾기 제목으로 사용됩니다.
       * 검색 엔진 최적화에서 가장 중요한 태그 중 하나입니다.
       * 권장 길이: 50~60자
       */}
      <title key="title">{title}</title>
      <meta
        key="viewport"
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />

      {/**
       * <meta name="description">: 검색 결과 미리보기 설명 텍스트
       * 구글 검색 결과에서 제목 아래에 표시되는 2~3줄의 설명입니다.
       * 검색 순위에 직접 영향은 적지만, 클릭률(CTR)에 영향을 줍니다.
       * 권장 길이: 150~160자
       */}
      <meta key="description" name="description" content={description} />

      {/**
       * <meta name="keywords">: 검색 키워드 (현대 구글은 거의 무시하지만 여전히 작성)
       * 쉼표로 구분된 관련 키워드 목록입니다.
       */}
      <meta
        key="keywords"
        name="keywords"
        content={keywords}
      />
      <meta key="author" name="author" content="ARCA" />
      {googleSiteVerification && (
        <meta
          key="google-site-verification"
          name="google-site-verification"
          content={googleSiteVerification}
        />
      )}

      {/* ────────────────────────────────────────
          표준 URL (Canonical URL)
          ──────────────────────────────────────── */}

      {/**
       * <link rel="canonical">: 이 페이지의 "대표 URL"을 지정합니다.
       * 같은 내용이 여러 URL에서 접근 가능할 때 (예: /?sort=price, /?sort=date)
       * 어느 URL이 "원본"인지 검색 엔진에게 알려줍니다.
       * → 중복 콘텐츠 페널티를 방지하고 링크 권위를 하나의 URL로 집중시킵니다.
       */}
      <link key="canonical" rel="canonical" href={canonical} />

      {/* ────────────────────────────────────────
          Open Graph 메타 태그 (소셜 미디어 공유)
          ──────────────────────────────────────── */}

      {/**
       * og:(Open Graph) 메타 태그들
       * 카카오톡, 페이스북, 디스코드 등에서 링크를 공유할 때
       * 미리보기 카드(제목/설명/이미지)를 생성하는 데 사용됩니다.
       *
       * property="og:type": 페이지 유형
       * - 'website': 일반 웹페이지 (메인 페이지에서 사용)
       * - 'product': 상품 페이지 (상세 페이지에서 사용)
       *
       * property="og:title": 공유 시 표시되는 제목
       * property="og:description": 공유 시 표시되는 설명
       * property="og:url": 공유 링크의 공식 URL
       * property="og:image": 공유 시 표시되는 대표 이미지 (1200×630px 권장)
       * property="og:site_name": 사이트 이름
       * property="og:locale": 콘텐츠 언어/지역 (ko_KR: 한국어/대한민국)
       */}
      <meta key="og:type" property="og:type" content={ogType} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={canonical} />
      <meta key="og:image" property="og:image" content={ogImage} />
      <meta key="og:site_name" property="og:site_name" content="ARCA" />
      <meta key="og:locale" property="og:locale" content="ko_KR" />

      {/* ────────────────────────────────────────
          Twitter Card 메타 태그
          ──────────────────────────────────────── */}

      {/**
       * twitter: 메타 태그들 — 트위터(X) 공유 시 미리보기 카드를 만듭니다.
       *
       * twitter:card: 카드 형식
       * - 'summary': 작은 정사각형 이미지 + 텍스트
       * - 'summary_large_image': 큰 가로형 이미지 (이 프로젝트에서 사용)
       *
       * 트위터가 og: 태그도 인식하지만, twitter: 태그가 우선입니다.
       */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={ogImage} />

      {/* ────────────────────────────────────────
          검색 엔진 크롤링 제어
          ──────────────────────────────────────── */}

      {/**
       * <meta name="robots">: 검색 엔진 크롤러에게 이 페이지를 어떻게 처리할지 지시합니다.
       *
       * index: 이 페이지를 검색 결과에 포함 (반대: noindex)
       * follow: 이 페이지의 링크를 따라가기 (반대: nofollow)
       * max-image-preview:large: 검색 결과에서 이미지를 크게 보여줌
       * max-snippet:-1: 설명 텍스트 길이 제한 없음 (-1 = 제한 없음)
       * max-video-preview:-1: 동영상 미리보기 제한 없음
       */}
      <meta
        key="robots"
        name="robots"
        content={robots}
      />

      {/* googlebot: 구글 봇에만 적용되는 크롤링 지시사항 */}
      <meta key="googlebot" name="googlebot" content={robots} />
      <meta key="bingbot" name="bingbot" content="index, follow" />
      <meta key="yeti" name="yeti" content="index, follow" />
      <meta key="language" name="language" content="Korean" />
      <meta key="content-language" httpEquiv="content-language" content="ko-KR" />
      <meta key="geo.region" name="geo.region" content="KR" />
      <meta key="geo.placename" name="geo.placename" content="South Korea" />

      {/* ────────────────────────────────────────
          모바일 최적화 메타 태그
          ──────────────────────────────────────── */}

      {/**
       * 모바일 PWA(Progressive Web App) 관련 메타 태그들:
       *
       * mobile-web-app-capable: Android Chrome에서 홈 화면 추가 시 앱처럼 동작
       * apple-mobile-web-app-capable: iOS Safari에서 홈 화면 추가 시 앱처럼 동작
       * apple-mobile-web-app-status-bar-style: iOS 상태바 스타일
       * - 'default': 기본 흰색/검정 상태바
       * - 'black': 검정 상태바
       * - 'black-translucent': 투명 상태바 (콘텐츠가 상태바 뒤까지 확장됨)
       */}
      <meta key="mobile-web-app-capable" name="mobile-web-app-capable" content="yes" />
      <meta key="apple-mobile-web-app-capable" name="apple-mobile-web-app-capable" content="yes" />
      <meta key="apple-mobile-web-app-status-bar-style" name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* ────────────────────────────────────────
          JSON-LD 구조화 데이터
          ──────────────────────────────────────── */}

      {/**
       * <script type="application/ld+json">: JSON-LD 구조화 데이터 삽입
       *
       * JSON-LD(Linked Data): schema.org 표준을 따르는 구조화된 데이터 형식입니다.
       * 검색 엔진이 페이지의 의미를 정확히 파악하도록 돕습니다.
       * 구글 검색에서 "리치 스니펫" (별점, 가격, FAQ 등)을 표시하게 합니다.
       *
       * dangerouslySetInnerHTML={{ __html: JSON.stringify(finalStructuredData) }}:
       * - React는 XSS 공격을 방지하기 위해 HTML 문자열을 직접 삽입하지 않습니다.
       * - dangerouslySetInnerHTML은 이 제한을 명시적으로 우회하는 prop입니다.
       * - 이름에 'dangerously'가 있는 이유: 사용자 입력을 그대로 넣으면 XSS 공격이 됩니다.
       *   여기서는 개발자가 직접 작성한 JSON이므로 안전합니다.
       * - __html: 이 키 이름이 React의 컨벤션입니다 (실수를 방지하기 위한 명시적 표현).
       *
       * JSON.stringify(finalStructuredData):
       * - JavaScript 객체를 JSON 문자열로 변환합니다.
       * - 예: { "@context": "https://schema.org", "@type": "WebSite", ... }
       *   → '{"@context":"https://schema.org","@type":"WebSite",...}'
       * Java 비유: objectMapper.writeValueAsString(finalStructuredData)
       */}
      {structuredDataItems.map((item, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
        />
      ))}
    </Head>
  );
}
