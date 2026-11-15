/**
 * utils/imageSearch.ts - 사진으로 비슷한 상품 찾기의 판단 로직 (순수 함수)
 *
 * 화면(pages/search-by-image.tsx)에서 쓰는 "판단"만 모았습니다. 파일을 받아도 되는지, 얼마나 줄일지,
 * 서버 응답을 어떤 화면 상태로 보여줄지를 정합니다. 브라우저 API나 네트워크를 쓰지 않아 Node 테스트로 검증합니다.
 *
 * 문구 원칙: 결과는 "이미지가 비슷한 정도"로 고른 것일 뿐입니다. "N% 일치", "같은 제품" 같은 표현을 쓰지 않습니다.
 */

import type { ImageSearchResult, WebImageSearchResult } from '../types';

/** 올릴 수 있는 원본 사진의 최대 크기 (올리기 전에 줄이므로 원본 기준) */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** 서버로 보내기 전에 맞출 긴 변의 최대 픽셀 */
export const MAX_IMAGE_EDGE = 1024;

export type FileCheck = { ok: true } | { ok: false; reason: string };

/** 선택한 파일을 받아도 되는지 확인합니다. */
export function validateImageFile(file: { type: string; size: number }): FileCheck {
  if (!file.type || !file.type.startsWith('image/')) {
    return { ok: false, reason: '이미지 파일만 올릴 수 있습니다.' };
  }
  if (file.size <= 0) {
    return { ok: false, reason: '빈 파일입니다. 다른 사진을 선택해 주세요.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: '사진이 너무 큽니다. 15MB 이하의 사진을 올려 주세요.' };
  }
  return { ok: true };
}

/** 비율을 지키면서 긴 변이 maxEdge 이하가 되는 크기를 계산합니다. 작은 사진은 키우지 않습니다. */
export function fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width, height };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** 검색 뒤 화면이 보여줄 상태 */
export type SearchView =
  | { kind: 'results' }
  | { kind: 'empty'; message: string }
  | { kind: 'unavailable'; message: string; retryable: boolean };

const GENERIC_FAILURE = '검색에 실패했습니다. 잠시 후 다시 시도해 주세요.';

/** 서버가 정상 응답(200)했을 때: 결과가 있으면 목록, 없으면 이유에 맞는 안내를 고릅니다. */
export function describeSearchOutcome(result: ImageSearchResult): SearchView {
  if (result.items.length > 0) {
    return { kind: 'results' };
  }
  switch (result.unavailableReason) {
    case 'DISABLED':
      return { kind: 'unavailable', message: '지금은 사진 검색을 쓸 수 없습니다.', retryable: false };
    case 'SEARCH_ERROR':
      return { kind: 'unavailable', message: GENERIC_FAILURE, retryable: true };
    default:
      // NO_MATCH, 그리고 서버가 나중에 추가할 수 있는 모르는 값
      return {
        kind: 'empty',
        message: '비슷한 세일 상품을 찾지 못했습니다. 다른 사진이나 필터로 다시 찾아보세요.',
      };
  }
}

const DETECTED_LABELS: Record<string, string> = {
  SHIRT: '셔츠', T_SHIRT: '티셔츠', KNIT: '니트', SWEATSHIRT: '맨투맨/후드', PANTS: '팬츠', JEANS: '청바지',
  SHORTS: '반바지', JACKET: '재킷', COAT: '코트', PADDING: '패딩', DRESS: '원피스', SKIRT: '스커트',
  SHOES: '신발', BAG: '가방', ACCESSORIES: '액세서리',
};
const WIDENED_LABELS: Record<string, string> = {
  TOP: '상의', BOTTOM: '하의', OUTER: '아우터', DRESS: '원피스', SKIRT: '스커트', SHOES: '신발', ETC: '잡화',
};

/** 사진에서 종류를 인식해 좁혀 찾았을 때 결과 위에 보여줄 한 줄. 인식하지 않았으면 null입니다. */
export function describeDetection(result: ImageSearchResult): string | null {
  const detected = result.detectedCategory ? DETECTED_LABELS[result.detectedCategory] : undefined;
  const widened = result.widenedTo ? WIDENED_LABELS[result.widenedTo] : undefined;
  if (!detected) {
    // 세부 종류는 가려내지 못했지만 대분류(아우터 등)는 인식한 경우
    return widened
      ? `사진을 ${widened}(으)로 인식해 ${widened}에서 찾았습니다. 다른 종류를 보려면 위에서 분류를 고르세요.`
      : null;
  }
  return widened
    ? `사진을 ${detected}(으)로 인식했습니다. 비슷한 ${detected}이(가) 적어 ${widened} 전체에서 찾았습니다.`
    : `사진을 ${detected}(으)로 인식해 ${detected}만 찾았습니다. 다른 종류를 보려면 위에서 분류를 고르세요.`;
}

/** 요청이 실패했을 때(HTTP 오류, 네트워크 오류): 상태 코드에 맞는 안내를 고릅니다. */
export function describeSearchFailure(status: number | undefined, serverMessage?: string): SearchView {
  if (status === 429) {
    return { kind: 'unavailable', message: '요청이 많습니다. 잠시 후 다시 시도해 주세요.', retryable: true };
  }
  if (status === 413) {
    return { kind: 'unavailable', message: '사진이 너무 큽니다. 다른 사진으로 시도해 주세요.', retryable: false };
  }
  if (status === 400) {
    // 서버가 이유를 알려준 경우(예: 이미지를 읽을 수 없음) 그 문구를 그대로 보여줍니다.
    return {
      kind: 'unavailable',
      message: serverMessage || '사진을 처리할 수 없습니다. 다른 사진으로 시도해 주세요.',
      retryable: false,
    };
  }
  return { kind: 'unavailable', message: GENERIC_FAILURE, retryable: true };
}

/** 분류 필터 한 칸. mainCategory나 subCategory 중 하나만 갖습니다("전체"는 둘 다 없음). */
export interface CategoryFilter {
  label: string;
  mainCategory?: string;
  subCategory?: string;
}

/**
 * 분류 필터. 값은 백엔드 enum 이름입니다.
 * 가방과 신발은 세부 분류(subCategory)로 찾습니다. 브랜드마다 대분류가 ETC나 SHOES로 다르게 들어와 있기 때문입니다.
 */
export const CATEGORY_FILTERS: CategoryFilter[] = [
  { label: '전체' },
  { label: '상의', mainCategory: 'TOP' },
  { label: '하의', mainCategory: 'BOTTOM' },
  { label: '아우터', mainCategory: 'OUTER' },
  { label: '원피스', mainCategory: 'DRESS' },
  { label: '스커트', mainCategory: 'SKIRT' },
  { label: '가방', subCategory: 'BAG' },
  { label: '신발', subCategory: 'SHOES' },
];

/** 성별 필터. 값은 백엔드 enum 이름입니다(화면의 Gender 타입과 표기가 다릅니다). */
export const GENDER_FILTERS: { label: string; gender?: string }[] = [
  { label: '전체' },
  { label: '여성', gender: 'WOMEN' },
  { label: '남성', gender: 'MEN' },
];

// ── 웹에서 찾은 SPA 브랜드 상품 ───────────────────────────────────────────────

/** 웹 결과 영역이 보여줄 상태. hidden이면 영역 자체를 그리지 않습니다. */
export type WebView =
  | { kind: 'results' }
  | { kind: 'hidden' }
  | { kind: 'note'; message: string };

const WEB_FAILURE = '웹 검색에 실패했습니다.';

/** 서버가 정상 응답했을 때의 웹 결과 상태. 기능이 꺼진 서버에서는 영역을 숨깁니다. */
export function describeWebOutcome(result: WebImageSearchResult): WebView {
  if (result.items.length > 0) {
    return { kind: 'results' };
  }
  switch (result.unavailableReason) {
    case 'DISABLED':
      return { kind: 'hidden' };
    case 'QUOTA_EXCEEDED':
      return { kind: 'note', message: '이번 달 웹 검색 한도를 모두 사용했습니다.' };
    case 'SEARCH_ERROR':
      return { kind: 'note', message: WEB_FAILURE };
    default:
      return { kind: 'note', message: '웹에서는 비슷한 SPA 브랜드 상품을 찾지 못했습니다.' };
  }
}

/** 웹 검색 요청이 실패했을 때의 상태. 이 기능이 없는 서버(404)에서는 영역을 숨깁니다. */
export function describeWebFailure(status: number | undefined): WebView {
  if (status === 404) {
    return { kind: 'hidden' };
  }
  if (status === 429) {
    return { kind: 'note', message: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' };
  }
  return { kind: 'note', message: WEB_FAILURE };
}

/**
 * 외부 검색 서비스가 돌려준 주소를 링크나 이미지 주소로 써도 되는지 확인합니다.
 * http(s) 절대 주소만 허용합니다(javascript:, data: 같은 주소가 링크로 들어가는 것을 막기 위해).
 */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}
