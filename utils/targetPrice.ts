/**
 * utils/targetPrice.ts - 목표 가격 입력을 해석합니다 (순수 함수)
 *
 * 사용자는 "25,000원"처럼 쉼표나 단위를 섞어 입력합니다. 그런 입력은 받아들이고,
 * 숫자가 아니거나 의미 없는 값은 저장하지 않고 이유를 돌려줍니다.
 *
 * 목표 가격이 현재가 이상이면 서버가 저장 즉시 조건을 평가해 바로 알림을 만듭니다.
 * 그래서 현재가보다 낮은 값만 허용합니다.
 */

export type TargetPriceResult = { ok: true; value: number } | { ok: false; reason: string };

/**
 * @param input        입력란의 문자열
 * @param currentPrice 상품의 현재 가격(원)
 */
export function parseTargetPrice(input: string, currentPrice: number): TargetPriceResult {
  if (!input.trim()) {
    return { ok: false, reason: '목표 가격을 입력해 주세요.' };
  }

  // 공백과 쉼표를 지우고, 끝에 붙은 "원"만 떼어냅니다.
  const digits = input.replace(/[\s,]/g, '').replace(/원$/, '');
  if (!/^\d+$/.test(digits)) {
    return { ok: false, reason: '숫자만 입력해 주세요.' };
  }

  const value = Number(digits);
  if (value <= 0) {
    return { ok: false, reason: '목표 가격은 0보다 커야 합니다.' };
  }
  if (value >= currentPrice) {
    return {
      ok: false,
      reason: `현재가(${currentPrice.toLocaleString('ko-KR')}원)보다 낮은 가격만 설정할 수 있습니다.`,
    };
  }
  return { ok: true, value };
}
