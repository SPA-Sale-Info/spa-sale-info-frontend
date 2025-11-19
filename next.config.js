/**
 * ============================================================================
 * next.config.js - Next.js 프로젝트 설정 파일
 * ============================================================================
 *
 * 🎯 Spring Boot로 비유하면?
 * - application.yml / application.properties와 동일한 역할
 * - 프로젝트 전체의 설정을 관리하는 중앙 설정 파일
 *
 * Spring Boot와 비교:
 * [Spring Boot - application.yml]
 * spring:
 *   profiles:
 *     active: dev
 * server:
 *   port: 8080
 *   compression:
 *     enabled: true
 * security:
 *   headers:
 *     frame-options: SAMEORIGIN
 *
 * [Next.js - next.config.js]
 * module.exports = {
 *   reactStrictMode: true,
 *   compress: true,
 *   headers: [...]
 * }
 *
 * 📝 주요 설정 항목:
 * 1. reactStrictMode: React 개발 모드 (디버깅 도구)
 * 2. images.domains: 외부 이미지 허용 도메인 (CORS 설정과 유사)
 * 3. env: 환경 변수 설정
 * 4. compress: HTTP 압축 활성화
 * 5. headers: 보안 헤더 설정 (Spring Security와 유사)
 *
 * ⚠️ 중요: 이 파일을 수정한 후에는 반드시 서버를 재시작해야 합니다!
 * - npm run dev를 중단하고 다시 실행
 * - Spring Boot에서 application.yml 수정 후 재시작하는 것과 동일
 */

/**
 * TypeScript 타입 힌트
 * - IDE에서 자동 완성을 도와주는 주석
 * - 실행에는 영향 없음 (주석이므로)
 *
 * Java의 @SuppressWarnings나 @NotNull 어노테이션과 비슷한 역할
 */
/** @type {import('next').NextConfig} */
const nextConfig = {

  /**
   * ============================================================================
   * React Strict Mode 설정
   * ============================================================================
   *
   * React의 엄격 모드를 활성화합니다.
   * - 개발 중 잠재적인 문제를 조기에 발견하는 도구
   * - 프로덕션 빌드에는 영향 없음 (개발 모드에서만 동작)
   *
   * 감지하는 문제들:
   * 1. 안전하지 않은 생명주기 메서드 사용
   * 2. 레거시 API 사용 경고
   * 3. 예상치 못한 부작용(side effects) 감지
   * 4. 더블 렌더링으로 순수성 검증 (컴포넌트가 순수 함수인지 확인)
   *
   * Spring Boot 비슷한 개념:
   * spring.profiles.active=dev (개발 모드 활성화)
   */
  reactStrictMode: true,

  /**
   * ============================================================================
   * 이미지 최적화 설정 (중요!)
   * ============================================================================
   *
   * Next.js의 Image 컴포넌트가 외부 이미지를 불러올 때 허용할 도메인 목록입니다.
   *
   * 왜 필요한가요?
   * - 보안: 신뢰할 수 없는 도메인의 이미지를 차단
   * - 최적화: Next.js가 이미지를 자동으로 최적화 (WebP 변환, 리사이징 등)
   * - 성능: CDN을 통한 이미지 캐싱
   *
   * Spring Boot와 비교:
   * @CrossOrigin(origins = {"https://image.hm.com", "https://static.zara.net"})
   * public class ImageController { ... }
   *
   * ⚠️ 주의사항:
   * - 새로운 브랜드 추가 시 해당 브랜드의 이미지 도메인을 여기에 추가해야 함
   * - 도메인을 추가한 후에는 반드시 서버 재시작 필요
   * - HTTPS와 HTTP를 구분함 (프로덕션에서는 HTTPS 권장)
   *
   * 도메인 추가 예시:
   * - H&M 이미지: https://image.hm.com/assets/hm/...
   * - ZARA 이미지: https://static.zara.net/photos/...
   */
  images: {
    domains: [
      'via.placeholder.com',      // 목업/플레이스홀더 이미지 (개발/테스트용)
      'image.hm.com',             // H&M 공식 이미지 서버
      'static.zara.net',          // ZARA 공식 CDN
      'www.uniqlo.com',           // Uniqlo 공식 웹사이트
      'image.uniqlo.com',         // Uniqlo 전용 이미지 CDN
      'img.muji.net',             // MUJI 글로벌 이미지 서버
      'product.mujikorea.co.kr',  // MUJI Korea 상품 이미지
      // 📝 새로운 브랜드 추가 시 여기에 도메인 추가
      // 예: 'images.mango.com',
      //     'static.massimodutti.com',
    ],
  },

  /**
   * ============================================================================
   * 환경 변수 설정
   * ============================================================================
   *
   * 클라이언트(브라우저)에서도 접근 가능한 환경 변수를 정의합니다.
   *
   * Spring Boot 비슷한 코드:
   * @Value("${api.url:http://localhost:8080}")
   * private String apiUrl;
   *
   * 주의사항:
   * - 이 방식은 레거시 방법입니다 (Next.js 9 이전)
   * - 최신 방식: .env.local 파일에 NEXT_PUBLIC_* 환경 변수 사용
   * - 하지만 하위 호환성을 위해 유지
   *
   * 사용 예시:
   * - 코드에서: process.env.API_URL
   * - 값: process.env.API_URL이 없으면 'http://localhost:8080' 사용
   */
  env: {
    /**
     * API 베이스 URL 설정
     * - 개발: http://localhost:8080 (백엔드 로컬 서버)
     * - 프로덕션: .env.production 파일에서 설정
     *
     * || 연산자: null/undefined면 오른쪽 기본값 사용
     * Java의 Optional.orElse()와 유사
     */
    API_URL: process.env.API_URL || 'http://localhost:8080',
  },

  /**
   * ============================================================================
   * HTTP 압축 활성화
   * ============================================================================
   *
   * 서버에서 HTML, CSS, JS 파일을 gzip으로 압축하여 전송합니다.
   * - 파일 크기 약 70% 감소
   * - 네트워크 트래픽 절감
   * - 페이지 로딩 속도 향상
   *
   * Spring Boot 비슷한 설정:
   * server:
   *   compression:
   *     enabled: true
   *     mime-types: text/html,text/css,application/javascript
   */
  compress: true,

  /**
   * ============================================================================
   * 보안 HTTP 헤더 설정
   * ============================================================================
   *
   * 모든 응답에 보안 관련 HTTP 헤더를 자동으로 추가합니다.
   *
   * Spring Boot의 Spring Security와 유사:
   * @Configuration
   * public class SecurityConfig {
   *     @Bean
   *     public SecurityFilterChain filterChain(HttpSecurity http) {
   *         http.headers()
   *             .frameOptions().sameOrigin()
   *             .contentTypeOptions()
   *             .and()
   *             .xssProtection();
   *         return http.build();
   *     }
   * }
   *
   * async headers():
   * - Next.js가 자동으로 호출하는 함수
   * - 배열 형태로 헤더 규칙을 반환
   */
  async headers() {
    return [
      {
        /**
         * source: 헤더를 적용할 URL 패턴
         * - '/:path*': 모든 경로에 적용
         * - Spring의 @RequestMapping("/**")와 유사
         */
        source: '/:path*',
        headers: [
          {
            /**
             * X-DNS-Prefetch-Control
             * - DNS 사전 조회를 활성화하여 외부 도메인 연결 속도 향상
             * - 브라우저가 미리 DNS 조회를 수행
             */
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            /**
             * X-Frame-Options
             * - 클릭재킹(Clickjacking) 공격 방지
             * - SAMEORIGIN: 같은 도메인에서만 iframe 허용
             *
             * Spring Security:
             * http.headers().frameOptions().sameOrigin()
             */
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            /**
             * X-Content-Type-Options
             * - MIME 타입 스니핑 방지 (보안 강화)
             * - nosniff: 브라우저가 MIME 타입을 추측하지 못하게 함
             *
             * Spring Security:
             * http.headers().contentTypeOptions()
             */
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            /**
             * Referrer-Policy
             * - 다른 사이트로 이동 시 Referer 헤더를 어떻게 보낼지 결정
             * - origin-when-cross-origin: 같은 사이트는 전체 URL, 다른 사이트는 origin만
             * - 사용자 프라이버시 보호
             */
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },

  /**
   * ============================================================================
   * URL 리다이렉트 설정
   * ============================================================================
   *
   * 특정 URL을 다른 URL로 리다이렉트합니다.
   * - 현재는 빈 배열 (리다이렉트 없음)
   *
   * Spring Boot의 RedirectView와 유사:
   * @GetMapping("/old-path")
   * public RedirectView redirect() {
   *     return new RedirectView("/new-path", true, true);
   * }
   *
   * 사용 예시:
   * async redirects() {
   *   return [
   *     {
   *       source: '/old-home',
   *       destination: '/',
   *       permanent: true,  // 301 영구 리다이렉트
   *     },
   *   ]
   * }
   */
  async redirects() {
    return []  // 현재는 리다이렉트 없음
  },
}

/**
 * CommonJS 방식으로 설정 객체 내보내기
 * - Next.js는 CommonJS 모듈 시스템을 사용
 * - ES6의 export default와 동일한 역할
 *
 * ES6 방식: export default nextConfig
 * CommonJS: module.exports = nextConfig
 */
module.exports = nextConfig
