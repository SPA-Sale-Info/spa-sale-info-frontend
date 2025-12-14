import { fetchSaleProducts } from '../utils/api';

const SITE_URL = 'https://mion-spa-info.vercel.app';

// BrandFilter.js와 동일한 브랜드 목록 상수
const BRANDS = [
  { code: 'all', name: '전체' },
  { code: 'HM', name: 'H&M' },
  { code: 'ZARA', name: 'ZARA' },
  { code: 'UNIQLO', name: 'UNIQLO' },
  { code: 'MUJI', name: 'MUJI' },
  { code: 'CHARLESKEITH', name: '찰스앤키스' },
  { code: 'COS', name: 'COS' },
  { code: 'ARKET', name: 'ARKET' },
  { code: 'MASSIMODUTTI', name: 'Massimo Dutti' },
];

/**
 * 모든 세일 상품을 페이지네이션을 통해 안전하게 가져오는 함수
 *
 * Google 크롤러 타임아웃을 방지하기 위해:
 * - 최대 상품 수 제한 (1000개)
 * - 최대 페이지 수 제한 (10페이지)
 * - 전체 타임아웃 설정 (10초)
 *
 * @returns {Promise<Array>} 전체 상품 목록 (최대 1000개)
 */
async function getAllSaleProducts() {
  let allProducts = [];
  let page = 0;
  const size = 100;
  let hasMore = true;

  // 안전장치: 최대 페이지 수 제한 (10페이지 = 1000개)
  const MAX_PAGES = 10;
  const MAX_PRODUCTS = 1000;

  // 타임아웃 설정 (10초)
  const TIMEOUT = 10000;
  const startTime = Date.now();

  while (hasMore && page < MAX_PAGES && allProducts.length < MAX_PRODUCTS) {
    try {
      // 타임아웃 체크
      if (Date.now() - startTime > TIMEOUT) {
        console.warn(`Sitemap: 타임아웃 도달 (${TIMEOUT}ms). 현재까지 ${allProducts.length}개 상품 수집.`);
        break;
      }

      const response = await fetchSaleProducts({ page, size });

      if (response && response.content && response.content.length > 0) {
        allProducts = allProducts.concat(response.content);
        console.log(`Sitemap: 페이지 ${page} 완료 (${response.content.length}개 상품, 누적: ${allProducts.length}개)`);
        page++;

        // 마지막 페이지이거나, 더 이상 콘텐츠가 없으면 중단
        if (response.last || response.content.length < size) {
          hasMore = false;
        }
      } else {
        // 응답이 없거나, content가 비어있으면 중단 (안전장치)
        console.warn(`Sitemap: 페이지 ${page}에서 빈 응답 받음. 중단.`);
        hasMore = false;
      }
    } catch (error) {
      console.error(`Sitemap: 페이지 ${page} 조회 실패. 현재까지 ${allProducts.length}개 상품으로 계속 진행.`, error);
      hasMore = false; // 에러 발생 시 중단
    }
  }

  console.log(`Sitemap: 총 ${allProducts.length}개 상품 수집 완료`);
  return allProducts;
}

/**
 * Sitemap XML 문자열을 생성하는 함수
 * @param {Array} products - 전체 상품 목록
 * @returns {string} XML 형식의 사이트맵
 */
function generateSiteMap(products) {
  const today = new Date().toISOString();

  // 정적 페이지 목록
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/style-guide', priority: '0.1', changefreq: 'yearly' },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 정적 페이지 -->
${staticPages
  .map(
    (page) => `  <url>
    <loc>${`${SITE_URL}${page.url}`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join('\n')}

  <!-- 브랜드별 필터 페이지 -->
${BRANDS
  .filter(brand => brand.code !== 'all') // '전체' 브랜드는 제외
  .map(
    (brand) => `  <url>
    <loc>${`${SITE_URL}/?brand=${brand.code}`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n')}

  <!-- 개별 상품 페이지 -->
${products
  .map((product) => {
    if (!product || !product.id) {
      return ''; // 유효하지 않은 상품 데이터는 건너뛰기
    }
    const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : today;
    return `  <url>
    <loc>${`${SITE_URL}/product/${product.id}`}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }).join('\n')}
</urlset>`;
}

/**
 * Next.js 서버사이드 렌더링 함수
 *
 * 중요: 이 함수는 매 요청마다 실행됩니다.
 * - Google 크롤러가 /sitemap.xml을 요청하면 이 함수가 실행됨
 * - API 호출이 실패해도 최소한의 sitemap은 반환해야 함 (정적 페이지)
 * - 에러가 발생해도 500 에러를 내지 않고 빈 sitemap이라도 반환
 *
 * @param {Object} context - Next.js context 객체
 * @param {Object} context.res - HTTP 응답 객체
 * @returns {Object} Next.js props 객체
 */
export async function getServerSideProps({ res }) {
  let products = [];
  let sitemap = '';

  try {
    console.log('Sitemap: 생성 시작');

    // 상품 데이터 조회 (타임아웃 및 에러 처리 포함)
    try {
      products = await getAllSaleProducts();
      console.log(`Sitemap: ${products.length}개 상품으로 sitemap 생성`);
    } catch (error) {
      console.error('Sitemap: 상품 조회 실패. 정적 페이지만으로 sitemap 생성.', error);
      // products는 빈 배열로 유지 - 정적 페이지만 포함
    }

    // sitemap 생성 (상품이 없어도 정적 페이지는 포함됨)
    sitemap = generateSiteMap(products);
    console.log('Sitemap: 생성 완료');

  } catch (error) {
    // 최악의 경우: sitemap 생성 자체가 실패
    console.error('Sitemap: 생성 중 치명적 오류 발생. 최소 sitemap 반환.', error);

    // 최소한의 sitemap이라도 반환 (홈페이지만)
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }

  // HTTP 응답 헤더 설정
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400' // 1시간 캐시, 24시간 재검증
  );

  // sitemap XML 반환
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
