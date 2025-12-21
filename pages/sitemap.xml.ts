/**
 * ============================================================================
 * sitemap.xml.js - 동적 Sitemap 생성 (Next.js API Route)
 * ============================================================================
 *
 * 🎯 왜 동적으로 생성하나요?
 * - public/sitemap.xml은 정적 파일이라 Google이 캐시 문제를 겪을 수 있음
 * - Next.js API Route로 생성하면 항상 최신 데이터 제공
 * - Content-Type 헤더를 정확하게 설정 가능
 *
 * Spring Boot 비유:
 * @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
 * public String generateSitemap() {
 *     return sitemapXml;
 * }
 */

/**
 * Sitemap 생성 함수
 *
 * @param {Object} req - HTTP 요청 객체
 * @param {Object} res - HTTP 응답 객체
 *
 * Next.js에서 /sitemap.xml 요청이 오면 이 함수가 자동 실행됨
 */
function generateSiteMap() {
  // 현재 날짜를 ISO 8601 형식으로 생성
  const today = new Date().toISOString()

  // 브랜드 목록 (BrandFilter.js와 동기화)
  const brands = [
    'HM',
    'ZARA',
    'UNIQLO',
    'MUJI',
    'CHARLESKEITH',
    'COS',
    'ARKET',
    'MASSIMODUTTI',
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 메인 페이지 -->
  <url>
    <loc>https://mion-spa-info.vercel.app/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- 브랜드별 페이지 -->
${brands
  .map(
    (brand) => `  <url>
    <loc>https://mion-spa-info.vercel.app/?brand=${brand}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`
}

/**
 * getServerSideProps를 사용한 동적 Sitemap 생성
 *
 * 이 방법은 /sitemap.xml 경로에서 XML을 직접 반환합니다.
 * API Route가 아닌 페이지 방식으로 구현되어 빌드 시 정상 작동합니다.
 */
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // sitemap XML 생성
  const sitemap = generateSiteMap()

  // HTTP 응답 헤더 설정
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')

  // XML 응답 전송
  res.write(sitemap)
  res.end()

  // 빈 props 반환 (페이지 렌더링 없음)
  return {
    props: {},
  }
}

/**
 * 이 컴포넌트는 실제로 렌더링되지 않습니다.
 * getServerSideProps에서 XML을 직접 응답하기 때문입니다.
 */
export default function Sitemap() {
  return null
}
