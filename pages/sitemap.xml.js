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
 * @returns {Promise<Array>} 전체 상품 목록
 */
async function getAllSaleProducts() {
  let allProducts = [];
  let page = 0;
  const size = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetchSaleProducts({ page, size });

      if (response && response.content && response.content.length > 0) {
        allProducts = allProducts.concat(response.content);
        page++;
        // 마지막 페이지이거나, 더 이상 콘텐츠가 없으면 중단
        if (response.last || response.content.length < size) {
          hasMore = false;
        }
      } else {
        // 응답이 없거나, content가 비어있으면 중단 (안전장치)
        hasMore = false;
      }
    } catch (error) {
      console.error(`Sitemap: Product fetch failed on page ${page}. Stopping.`, error);
      hasMore = false; // 에러 발생 시 중단
    }
  }
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

export async function getServerSideProps({ res }) {
  const products = await getAllSaleProducts();
  const sitemap = generateSiteMap(products);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400' // 1시간 캐시, 24시간 재검증
  );

  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
