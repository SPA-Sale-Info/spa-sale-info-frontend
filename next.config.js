/**
 * Next.js 설정 파일
 *
 * 이 파일은 Next.js 프로젝트의 전체적인 설정을 관리합니다.
 * - 이미지 최적화 설정
 * - 환경 변수 설정
 * - 빌드 옵션 등을 여기서 관리합니다
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React의 Strict Mode를 활성화합니다
  // Strict Mode는 개발 중 잠재적인 문제를 찾아주는 도구입니다
  reactStrictMode: true,

  // 외부 이미지를 사용할 도메인을 지정합니다
  // SPA 브랜드의 이미지를 불러오기 위해 필요한 설정입니다
  images: {
    domains: [
      'via.placeholder.com', // 목업 이미지 (개발용)
      'image.hm.com',        // H&M 이미지
      'static.zara.net',     // ZARA 이미지
      'www.uniqlo.com',      // Uniqlo 이미지
      'img.muji.net',        // MUJI 이미지
      // 추가 브랜드 도메인은 여기에 계속 추가하면 됩니다
    ],
  },

  // 환경 변수를 클라이언트에서도 사용할 수 있게 설정
  env: {
    // API 엔드포인트를 여기서 관리합니다
    // 추후 백엔드 API가 준비되면 이 값을 변경하면 됩니다
    API_URL: process.env.API_URL || 'http://localhost:8000',
  },
}

// 설정을 export하여 Next.js가 사용할 수 있게 합니다
module.exports = nextConfig
