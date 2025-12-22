/**
 * url.ts
 *
 * 외부 링크를 열 때 "안전한 URL"만 허용하도록 가공하는 유틸리티입니다.
 * TypeScript 문법 포인트:
 * - 함수의 파라미터와 반환값에 타입을 붙여 안정성을 높입니다.
 * - `string | undefined | null`은 "문자열일 수도 있고 아닐 수도 있음"을 의미합니다.
 */

/**
 * 외부로 이동 가능한 안전한 URL만 반환합니다.
 *
 * 허용 기준:
 * - 문자열이 존재해야 합니다.
 * - 명시된 경우 https 프로토콜만 허용합니다.
 * - 프로토콜이 없으면 현재 오리진 기준 상대 경로로 처리합니다.
 */
// 함수 선언: `export`로 다른 파일에서 import 가능하게 만듭니다.
export function getSafeExternalUrl(rawUrl: string | undefined | null): string | null {
  // 1) 입력값이 문자열이 아니면 안전하게 null 반환
  if (typeof rawUrl !== 'string') {
    return null;
  }

  // 2) 공백 제거 후, 비어있거나 "#"이면 링크 없음으로 처리
  const trimmedUrl = rawUrl.trim();

  if (trimmedUrl === '' || trimmedUrl === '#') {
    return null;
  }

  // 3) "http://", "https://"처럼 프로토콜이 명시되어 있는지 확인합니다.
  //    정규식은 "알파벳으로 시작하는 프로토콜 패턴"을 검사합니다.
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl);

  try {
    /**
     * SSR 환경에서는 window가 없으므로 기본 origin을 임시 지정합니다.
     */
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

    // 4) URL 파싱: 상대 경로도 안전하게 처리하기 위해 baseOrigin을 사용
    const parsedUrl = new URL(rawUrl, baseOrigin);
    const protocol = parsedUrl.protocol.toLowerCase();

    /**
     * 프로토콜이 명시되지 않았다면 같은 오리진의 상대 경로입니다.
     */
    if (!hasProtocol) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }

    /**
     * http는 혼합 콘텐츠를 유발할 수 있으므로 https만 허용합니다.
     */
    if (protocol === 'https:') {
      return parsedUrl.href;
    }

    // 5) 허용되지 않는 프로토콜이면 차단
    return null;
  } catch {
    // 6) URL 파싱 자체가 실패하면 유효하지 않은 URL로 간주
    return null;
  }
}
