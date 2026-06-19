/**
 * utils/parseSearchQuery.ts - 자연어 검색 파서 (규칙 기반)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * "5만원 이하 30% 할인 유니클로 니트" 같은 한국어 문장을
 * 실제 필터 조건(브랜드/성별/카테고리/최대가격/최소할인율)으로 변환합니다.
 * 매칭되지 않은 나머지 단어는 일반 검색 키워드로 남깁니다.
 *
 * ⚠️ 정직한 설명:
 * 이것은 LLM이 아니라 "규칙 기반(정규식/사전 매칭)" 파서입니다.
 * 외부 API 키 없이 100% 클라이언트에서 동작하므로 비용/지연이 없고,
 * 데모/오프라인에서 항상 같은 결과를 냅니다. 더 유연한 해석이 필요하면
 * 이 함수를 LLM 호출(문장 → 필터 JSON)로 교체할 수 있도록 반환 형태를
 * 동일하게 설계했습니다.
 *
 * Java/Spring 비유:
 * 검색어를 받아 Specification/QueryDSL 조건으로 변환하는 파서 컴포넌트와 유사합니다.
 */

import { ACTIVE_BRAND_CODES, BRAND_METADATA } from '../types';
import type { Brand, Gender, Category } from '../types';

/**
 * ParsedQuery - 파싱 결과 구조
 * 각 필드는 "해석에 성공한 경우에만" 채워집니다(없으면 undefined).
 * keyword에는 필터로 해석되지 않은 나머지 텍스트가 들어갑니다.
 */
export interface ParsedQuery {
  keyword: string;          // 필터로 소비되고 남은 일반 검색어
  brand?: Brand | 'all';
  gender?: Gender | 'all';
  category?: Category | 'all';
  maxPrice?: number;        // "N원 이하" → 최대 가격
  minDiscount?: number;     // "N% 이상" → 최소 할인율
  // 사용자에게 "이렇게 이해했어요"를 보여주기 위한 사람이 읽는 요약 칩들
  appliedLabels: string[];
}

/**
 * 브랜드 별칭 사전 — 한글/영문 표기를 브랜드 코드로 매핑합니다.
 * (정규화: 소문자 + 공백/기호 제거 후 비교)
 */
const BRAND_KEYWORDS: Record<string, Brand> = {
  '유니클로': 'UNIQLO', 'uniqlo': 'UNIQLO',
  '자라': 'ZARA', 'zara': 'ZARA',
  '에이치엔엠': 'HM', 'hm': 'HM', 'h&m': 'HM', '에이치앤엠': 'HM',
  '무지': 'MUJI', 'muji': 'MUJI', '무인양품': 'MUJI',
  '찰스앤키스': 'CHARLESKEITH', '찰스앤키스즈': 'CHARLESKEITH',
  'charleskeith': 'CHARLESKEITH', 'charles&keith': 'CHARLESKEITH',
};

/**
 * 성별 키워드 사전
 */
const GENDER_KEYWORDS: Record<string, Gender> = {
  '남성': 'MAN', '남자': 'MAN', '맨즈': 'MAN', 'men': 'MAN', 'man': 'MAN',
  '여성': 'WOMAN', '여자': 'WOMAN', '우먼': 'WOMAN', 'women': 'WOMAN', 'woman': 'WOMAN',
  '공용': 'UNISEX', '유니섹스': 'UNISEX', 'unisex': 'UNISEX',
};

/**
 * 카테고리 키워드 사전 — 일상어를 5개 그룹(TOP/BOTTOM/OUTER/SHOES/ETC)으로 매핑합니다.
 */
const CATEGORY_KEYWORDS: Record<string, Category> = {
  '상의': 'TOP', '티셔츠': 'TOP', '티': 'TOP', '니트': 'TOP', '셔츠': 'TOP',
  '맨투맨': 'TOP', '후드': 'TOP', '블라우스': 'TOP', '원피스': 'TOP', '스웨터': 'TOP',
  '하의': 'BOTTOM', '바지': 'BOTTOM', '팬츠': 'BOTTOM', '청바지': 'BOTTOM',
  '진': 'BOTTOM', '슬랙스': 'BOTTOM', '반바지': 'BOTTOM', '스커트': 'BOTTOM', '치마': 'BOTTOM',
  '아우터': 'OUTER', '자켓': 'OUTER', '재킷': 'OUTER', '코트': 'OUTER',
  '패딩': 'OUTER', '점퍼': 'OUTER', '가디건': 'OUTER', '카디건': 'OUTER',
  '신발': 'SHOES', '슈즈': 'SHOES', '운동화': 'SHOES', '스니커즈': 'SHOES', '구두': 'SHOES',
  '가방': 'ETC', '백': 'ETC', '액세서리': 'ETC', '모자': 'ETC', '양말': 'ETC',
};

/**
 * 문자열 정규화: 소문자 + 공백/기호 제거 (별칭 매칭용)
 */
const normalize = (s: string): string => s.toLowerCase().replace(/[\s\-&]/g, '');

/**
 * parseSearchQuery - 자연어 검색어를 필터 조건으로 변환합니다.
 *
 * @param raw - 사용자가 입력한 원문 (예: "5만원 이하 검정 니트 유니클로")
 * @returns ParsedQuery
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  const result: ParsedQuery = { keyword: '', appliedLabels: [] };
  // 남은 텍스트(여기서 필터로 인식된 부분을 점점 제거해 나갑니다)
  let remaining = ` ${raw} `;

  // ── 1) 가격: "5만원 이하", "50000원 이하", "5만 이하", "5만원대" ──
  // (가) "N만원/만 이하"
  const manMatch = remaining.match(/(\d+)\s*만\s*원?\s*(이하|이내|under|밑)/i);
  if (manMatch) {
    result.maxPrice = Number(manMatch[1]) * 10000;
    result.appliedLabels.push(`${manMatch[1]}만원 이하`);
    remaining = remaining.replace(manMatch[0], ' ');
  } else {
    // (나) "50000원 이하" 처럼 숫자 그대로
    const wonMatch = remaining.match(/(\d{4,})\s*원?\s*(이하|이내|under|밑)/i);
    if (wonMatch) {
      result.maxPrice = Number(wonMatch[1]);
      result.appliedLabels.push(`${Number(wonMatch[1]).toLocaleString()}원 이하`);
      remaining = remaining.replace(wonMatch[0], ' ');
    }
  }

  // ── 2) 할인율: "30% 이상", "30프로 이상", "반값" ──
  if (/반\s*값|반\s*가/.test(remaining)) {
    result.minDiscount = 50;
    result.appliedLabels.push('50% 이상');
    remaining = remaining.replace(/반\s*값|반\s*가/g, ' ');
  } else {
    const discountMatch = remaining.match(/(\d{1,2})\s*(%|프로|퍼센트|퍼)\s*(이상|넘는|over)?/i);
    if (discountMatch) {
      result.minDiscount = Number(discountMatch[1]);
      result.appliedLabels.push(`${discountMatch[1]}% 이상`);
      remaining = remaining.replace(discountMatch[0], ' ');
    }
  }

  // ── 3) 브랜드 ── (정규화 비교로 토큰을 찾고 제거)
  for (const token of remaining.trim().split(/\s+/)) {
    if (!token) continue;
    const brand = BRAND_KEYWORDS[normalize(token)];
    if (brand) {
      result.brand = brand;
      result.appliedLabels.push(BRAND_METADATA[brand].name);
      remaining = remaining.replace(token, ' ');
      break;
    }
  }

  // ── 4) 성별 ──
  for (const token of remaining.trim().split(/\s+/)) {
    if (!token) continue;
    const gender = GENDER_KEYWORDS[normalize(token)];
    if (gender) {
      result.gender = gender;
      const label = gender === 'MAN' ? '남성' : gender === 'WOMAN' ? '여성' : '공용';
      result.appliedLabels.push(label);
      remaining = remaining.replace(token, ' ');
      break;
    }
  }

  // ── 5) 카테고리 ── (부분 포함 매칭: "니트" 등)
  for (const [word, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (remaining.includes(word)) {
      result.category = category;
      const label = { TOP: '상의', BOTTOM: '하의', OUTER: '아우터', SHOES: '신발', ETC: '기타' }[category];
      result.appliedLabels.push(label);
      // 카테고리 단어 자체는 키워드로도 유효하므로 제거하지 않고 남겨둡니다.
      break;
    }
  }

  // 남은 텍스트를 정리해 일반 검색어로 사용합니다.
  result.keyword = remaining.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * isActiveBrand - 파싱된 브랜드가 현재 세일 데이터를 제공하는 활성 브랜드인지 확인합니다.
 * (준비 중/세일 없음 브랜드로 필터링하면 결과가 비기 때문에 호출부에서 활용)
 */
export function isActiveBrand(brand: Brand): boolean {
  return (ACTIVE_BRAND_CODES as readonly string[]).includes(brand);
}
