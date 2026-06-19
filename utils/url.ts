/**
 * utils/url.ts - URL 안전 처리 유틸리티 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 외부 링크로 이동하기 전에 URL이 안전한지 검사하고 정규화합니다.
 * 위험한 프로토콜(javascript:, data:, file: 등)은 차단합니다.
 * 안전한 https URL과 상대 경로만 허용합니다.
 *
 * 이 함수가 왜 필요한가요?
 * API에서 받은 상품 링크가 항상 올바른 URL이 아닐 수 있습니다.
 * 잘못된 URL은 브라우저 오류를 일으키거나, 보안 위협이 될 수 있습니다.
 * 예: 'javascript:alert("해킹!")' 같은 XSS 공격 URL을 차단합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 보안 개념: XSS(Cross-Site Scripting) 방지
 * ═══════════════════════════════════════════════════════════════
 * 'javascript:' 프로토콜을 URL로 사용하면 스크립트가 실행될 수 있습니다.
 * 이 함수는 https:만 허용하여 이런 공격을 차단합니다.
 * Java Spring에서 @RequestParam의 유효성 검사와 비슷한 역할입니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - 함수의 파라미터 타입: rawUrl: string | undefined | null
 *   "문자열이거나 undefined이거나 null일 수 있다"는 유니온 타입
 * - 반환 타입: string | null
 *   "문자열이거나 null을 반환한다"는 유니온 타입
 * - typeof 연산자: 런타임에 값의 타입을 검사합니다.
 * - 정규식(Regular Expression): /패턴/.test(문자열)로 패턴 매칭을 수행합니다.
 * - new URL(url, base): URL 파싱 API — URL을 구성 요소로 분해합니다.
 */

/**
 * getSafeExternalUrl - 안전한 외부 URL만 반환하는 함수
 *
 * 처리 순서:
 * 1. 문자열인지 확인 (아니면 null 반환)
 * 2. 공백 제거 후 빈 문자열 또는 '#' 확인
 * 3. 프로토콜이 있는지 확인 (정규식 사용)
 * 4. URL.parse()로 URL을 파싱하여 프로토콜을 추출
 * 5. https: 프로토콜만 허용, 그 외 차단
 *
 * @param rawUrl - 검사할 원본 URL (null, undefined, 빈 문자열 가능)
 * @returns 안전한 URL 문자열, 또는 null (안전하지 않거나 유효하지 않은 경우)
 *
 * 사용 예시:
 * getSafeExternalUrl('https://www.hm.com/product/123') → 'https://www.hm.com/product/123'
 * getSafeExternalUrl('javascript:alert("xss")') → null (차단)
 * getSafeExternalUrl('/product/123') → '/product/123' (상대 경로 허용)
 * getSafeExternalUrl(null) → null
 * getSafeExternalUrl('') → null
 *
 * Java 비유:
 * public static String getSafeExternalUrl(String rawUrl) {
 *   if (rawUrl == null) return null;
 *   // ... 검사 로직
 * }
 */
export function getSafeExternalUrl(rawUrl: string | undefined | null): string | null {
  /**
   * 1단계: 타입 검사
   *
   * typeof rawUrl !== 'string':
   * - typeof 연산자는 런타임에 값의 타입을 문자열로 반환합니다.
   * - typeof null === 'object' (JavaScript의 유명한 버그이지만 사양에 포함됨)
   * - typeof undefined === 'undefined'
   * - typeof 'hello' === 'string'
   * - typeof 123 === 'number'
   *
   * rawUrl이 undefined나 null이면 typeof가 'object' 또는 'undefined'를 반환하므로
   * 이 조건이 true가 되어 null을 반환합니다.
   *
   * TypeScript는 이미 타입으로 알고 있지만,
   * 런타임(실제 실행 시)에는 타입 정보가 없으므로 명시적 검사가 필요합니다.
   */
  if (typeof rawUrl !== 'string') {
    return null;
  }

  /**
   * 2단계: 공백 제거 및 빈 URL 처리
   *
   * .trim(): 문자열 앞뒤의 공백(스페이스, 탭, 개행)을 제거합니다.
   * 예: '  https://example.com  ' → 'https://example.com'
   * Java 비유: rawUrl.trim()
   *
   * trimmedUrl === '#': '#'만 있는 URL (페이지 최상단으로 이동, 실제 링크 없음)
   * → 링크 없음으로 처리합니다.
   */
  const trimmedUrl = rawUrl.trim();

  if (trimmedUrl === '' || trimmedUrl === '#') {
    return null;
  }

  /**
   * 3단계: 프로토콜 존재 여부 확인
   *
   * 정규식(Regular Expression): /패턴/플래그
   * - /^[a-zA-Z][a-zA-Z\d+.-]*:/: 이 패턴이 URL에 존재하는지 검사합니다.
   *
   * 패턴 분석:
   * - ^: 문자열의 시작 (start)
   * - [a-zA-Z]: 영문 알파벳 하나 (대소문자 모두)
   * - [a-zA-Z\d+.-]*: 알파벳, 숫자, +, ., - 중 하나가 0번 이상
   *   \d: 숫자(0-9)의 단축 표현
   *   *: 0번 이상 반복 (없어도 됨)
   * - :: 콜론 (프로토콜 구분자)
   *
   * 매칭 예시:
   * - 'https://example.com' → 매칭 (h-t-t-p-s + : )
   * - 'http://example.com' → 매칭
   * - 'javascript:alert()' → 매칭 (javascript + :)
   * - '/product/123' → 불매칭 (슬래시로 시작)
   * - '//example.com' → 불매칭
   *
   * .test(문자열): 정규식 패턴이 문자열과 일치하면 true, 아니면 false
   * Java 비유: Pattern.compile(regex).matcher(trimmedUrl).find()
   */
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl);

  try {
    /**
     * SSR(서버 사이드 렌더링) 환경 대응:
     *
     * typeof window !== 'undefined':
     * - 브라우저에서는 window 객체가 존재합니다.
     * - Node.js 서버에서는 window가 없습니다 (undefined).
     * - 이 삼항 연산자로 환경에 따라 다른 값을 사용합니다.
     *
     * window.location.origin: 현재 페이지의 출처 (프로토콜 + 도메인 + 포트)
     * 예: 'https://mion-spa-info.vercel.app'
     *
     * 'https://example.com': 서버 환경에서 임시로 사용하는 기본값
     * → 서버에서 상대 경로를 파싱할 때 기준이 됩니다.
     */
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

    /**
     * new URL(rawUrl, baseOrigin): URL을 파싱합니다.
     *
     * URL 생성자:
     * - 첫 번째 인자: 파싱할 URL (절대 또는 상대 경로)
     * - 두 번째 인자: 기준 URL (상대 경로일 때 사용)
     *
     * 절대 URL이면 두 번째 인자(baseOrigin)를 무시합니다.
     * 상대 경로면 baseOrigin과 합쳐서 파싱합니다.
     *
     * 예:
     * new URL('https://hm.com/product', 'https://example.com')
     * → URL { href: 'https://hm.com/product', protocol: 'https:', ... }
     *
     * new URL('/product/123', 'https://mysite.com')
     * → URL { href: 'https://mysite.com/product/123', pathname: '/product/123', ... }
     *
     * URL 파싱에 실패하면(잘못된 URL) 예외를 던집니다 → catch 블록으로 이동
     * Java 비유: new URI(rawUrl).toURL()
     */
    const parsedUrl = new URL(rawUrl, baseOrigin);

    /**
     * .protocol: 파싱된 URL의 프로토콜 부분
     * 예: 'https:', 'http:', 'javascript:', 'mailto:'
     * 항상 콜론(:)이 포함된 소문자 문자열로 반환됩니다.
     *
     * .toLowerCase(): 대소문자 관계없이 비교하기 위해 소문자로 변환합니다.
     * 예: 'HTTPS:' → 'https:'
     */
    const protocol = parsedUrl.protocol.toLowerCase();

    /**
     * 상대 경로 처리:
     *
     * !hasProtocol: 원본 URL에 프로토콜이 없었다면 (예: '/product/123')
     * → 내부 상대 경로이므로 그대로 반환합니다.
     *
     * parsedUrl.pathname: URL의 경로 부분 (예: '/product/123')
     * parsedUrl.search: 쿼리 문자열 (예: '?sort=price')
     * parsedUrl.hash: 해시 (예: '#section1')
     *
     * 세 부분을 이어붙여 상대 경로를 재구성합니다.
     * 예: '/product/123?sort=price#details'
     */
    if (!hasProtocol) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }

    /**
     * 프로토콜 검사:
     *
     * protocol === 'https:': HTTPS 프로토콜만 허용합니다.
     * - https: 암호화된 안전한 연결
     * - http: 허용하지 않습니다 (혼합 콘텐츠 문제, 보안 취약)
     * - javascript: 절대 허용하지 않습니다 (XSS 공격 위험)
     * - data: 허용하지 않습니다 (데이터 URI 악용 가능)
     * - file: 허용하지 않습니다 (로컬 파일 접근)
     *
     * parsedUrl.href: 파싱 후 정규화된 전체 URL 문자열을 반환합니다.
     * 예: 'https://www.hm.com/ko_kr/product/123'
     */
    if (protocol === 'https:') {
      return parsedUrl.href;
    }

    // 허용되지 않는 프로토콜 (http:, javascript:, data: 등) → 차단
    return null;
  } catch {
    /**
     * URL 파싱 실패 처리:
     * new URL()이 유효하지 않은 URL에서 TypeError를 던집니다.
     * 파싱에 실패하면 안전하지 않은 URL로 간주하고 null을 반환합니다.
     *
     * catch 블록에 변수명이 없는 이유:
     * TypeScript 4.0+에서는 catch (e) 대신 catch {}로 쓸 수 있습니다.
     * 에러 객체가 필요하지 않을 때 변수명을 생략합니다.
     */
    return null;
  }
}
