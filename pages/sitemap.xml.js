import { fetchSaleProducts } from '../utils/api';

const SITE_URL = 'https://mion-spa-info.vercel.app';

// BrandFilter.js와 동일한 브랜드 목록 상수. API 호출 대신 사용.
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
  // 'comingSoon: true'인 브랜드는 사이트맵에 포함하지 않음
];


/**
 * SIMPLIFIED FOR DEBUGGING: Fetches only the first page of sale products.
 * @returns {Promise<Array>} A single page of products, or an empty array on failure.
 */
async function getFirstPageOfProducts() {
  console.log('Sitemap(Debug): Starting to fetch FIRST PAGE of sale products...');
  try {
    const response = await fetchSaleProducts({ page: 0, size: 100 });
    if (response && response.content) {
      console.log(`Sitemap(Debug): Fetched ${response.content.length} products from page 0.`);
      return response.content;
    } else {
      console.error('Sitemap(Debug): Invalid response structure from fetchSaleProducts.');
      return [];
    }
  } catch (error) {
    console.error(`Sitemap(Debug): CRITICAL - Failed to fetch products on page 0.`, error);
    return []; // Return empty array on error to prevent crash
  }
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

  <!-- 개별 상품 페이지 (첫 페이지만) -->
${products
  .map((product) => {
    if (!product || !product.id) {
      console.warn('Sitemap(Debug): Skipping invalid product item.', product);
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
  console.log("Sitemap(Debug): getServerSideProps execution started (SIMPLIFIED).");
  
  const products = await getFirstPageOfProducts();
  console.log(`Sitemap(Debug): Product fetching complete. Found ${products.length} products.`);
  
  const sitemap = generateSiteMap(products);
  console.log("Sitemap(Debug): Sitemap XML string generated.");
  
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=600, stale-while-revalidate=86400'
  );
  console.log("Sitemap(Debug): Response headers have been set.");
  
  res.write(sitemap);
  console.log("Sitemap(Debug): Sitemap XML written to response.");
  
  res.end();
  console.log("Sitemap(Debug): Response has been ended.");

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
