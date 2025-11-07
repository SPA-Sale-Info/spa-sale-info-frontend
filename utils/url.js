/**
 * url.js - 브라우저에서 사용할 안전한 URL 유틸리티
 */

/**
 * 외부로 이동 가능한 안전한 URL만 반환합니다.
 *
 * 허용 기준:
 * - 문자열이 존재해야 합니다.
 * - 명시된 경우 https 프로토콜만 허용합니다.
 * - 프로토콜이 없으면 현재 오리진 기준 상대 경로로 처리합니다.
 *
 * @param {string} rawUrl - 검증할 원본 URL 문자열
 * @returns {string|null} 검증을 통과한 URL 또는 null
 */
export function getSafeExternalUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    return null
  }

  const trimmedUrl = rawUrl.trim()

  if (trimmedUrl === '' || trimmedUrl === '#') {
    return null
  }

  // "http://"처럼 시작하는지 확인합니다.
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl)

  try {
    /**
     * SSR 환경에서는 window가 없으므로 기본 origin을 임시 지정합니다.
     * 상대 경로가 들어올 경우 현재 호스트 기준으로 해석하기 위함입니다.
     */
    const baseOrigin = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://example.com'

    const parsedUrl = new URL(rawUrl, baseOrigin)
    const protocol = parsedUrl.protocol.toLowerCase()

    /**
     * 프로토콜이 명시되지 않았다면 같은 오리진의 상대 경로입니다.
     * 그대로 반환하면 CSR/SSR 렌더링 결과가 다를 수 있으므로 상대 경로만 돌려줍니다.
     */
    if (!hasProtocol) {
      // 예) "/detail/123" 같은 내부 링크는 그대로 돌려줍니다.
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    }

    /**
     * http는 혼합 콘텐츠를 유발할 수 있으므로 https만 허용합니다.
     */
    if (protocol === 'https:') {
      return parsedUrl.href
    }

    return null
  } catch {
    // URL 파싱 중 오류가 나면 그냥 링크를 사용하지 않습니다.
    return null
  }
}
