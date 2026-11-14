/**
 * utils/priceInsightCopy.ts - 가격 통계 판정을 화면 문구로 바꿉니다 (순수 함수)
 *
 * 백엔드의 가격 이력은 "추적을 시작한 뒤 가격이 바뀐 기록"뿐입니다. 그래서 "역대 최저가"라고 쓰지 않고
 * "추적 시작 이후 최저가"라고 씁니다. 구매를 권하는 표현도 쓰지 않고 사실만 적습니다.
 *
 * 이 파일은 Node 내장 테스트 러너가 그대로 실행하므로 타입 외에는 import 하지 않습니다.
 */

import type { PriceInsight } from '../types';

/** 화면에 보여줄 한 줄. tone은 강조 여부만 정합니다(good = 최저가이거나 가까움). */
export interface PriceInsightCopy {
  tone: 'good' | 'neutral';
  text: string;
}

const formatWon = (price: number): string => `${price.toLocaleString('ko-KR')}원`;

/** 'YYYY-MM-DD' → 'M월 D일'. 형식이 다르면 null */
const formatMonthDay = (isoDate: string | null): string | null => {
  const match = isoDate ? /^\d{4}-(\d{2})-(\d{2})/.exec(isoDate) : null;
  return match ? `${Number(match[1])}월 ${Number(match[2])}일` : null;
};

/**
 * 판정을 문구로 바꿉니다. 보여줄 것이 없으면 null을 돌려주고, 화면은 아무것도 그리지 않습니다.
 */
export function describePriceInsight(insight: PriceInsight): PriceInsightCopy | null {
  const { verdict, currentPrice, lowestPrice, lowestPriceDate, trackedDays } = insight;

  switch (verdict) {
    case 'NO_CHANGE':
      return { tone: 'neutral', text: `추적 ${trackedDays}일 동안 가격 변동 없음` };

    case 'LOWEST':
      return { tone: 'good', text: '추적 시작 이후 최저가' };

    case 'NEAR_LOWEST':
      return lowestPrice === null
        ? null
        : { tone: 'good', text: `최저가에 가까움 (최저 ${formatWon(lowestPrice)})` };

    case 'ABOVE_LOWEST': {
      if (lowestPrice === null || currentPrice === null) {
        return null;
      }
      const gap = formatWon(currentPrice - lowestPrice);
      const date = formatMonthDay(lowestPriceDate);
      return {
        tone: 'neutral',
        text: date
          ? `최저가보다 ${gap} 높음 · ${date}에 ${formatWon(lowestPrice)}`
          : `최저가보다 ${gap} 높음 (최저 ${formatWon(lowestPrice)})`,
      };
    }

    default:
      // INSUFFICIENT_DATA, 그리고 서버가 나중에 추가할 수 있는 모르는 값
      return null;
  }
}
