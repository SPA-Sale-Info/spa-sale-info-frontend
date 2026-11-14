// 가격 통계 판정을 화면 문구로 바꾸는 규칙을 검증합니다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { describePriceInsight } from '../utils/priceInsightCopy.ts';

const base = {
  productId: 'p1', currentPrice: 29900, lowestPrice: 24900, lowestPriceDate: '2026-10-02',
  highestPrice: 39900, trackedSince: '2026-08-14', trackedDays: 92, changeCount: 2,
};

test('판정 보류는 아무것도 보여주지 않는다', () => {
  assert.equal(describePriceInsight({ ...base, verdict: 'INSUFFICIENT_DATA' }), null);
});

test('가격 변동 없음', () => {
  assert.deepEqual(describePriceInsight({ ...base, verdict: 'NO_CHANGE', changeCount: 0 }),
    { tone: 'neutral', text: '추적 92일 동안 가격 변동 없음' });
});

test('추적 시작 이후 최저가', () => {
  assert.deepEqual(describePriceInsight({ ...base, currentPrice: 24900, verdict: 'LOWEST' }),
    { tone: 'good', text: '추적 시작 이후 최저가' });
});

test('최저가에 가까움', () => {
  assert.deepEqual(describePriceInsight({ ...base, currentPrice: 26000, verdict: 'NEAR_LOWEST' }),
    { tone: 'good', text: '최저가에 가까움 (최저 24,900원)' });
});

test('최저가보다 높음: 차액과 최저가 날짜를 보여준다', () => {
  assert.deepEqual(describePriceInsight({ ...base, verdict: 'ABOVE_LOWEST' }),
    { tone: 'neutral', text: '최저가보다 5,000원 높음 · 10월 2일에 24,900원' });
});

test('최저가 날짜가 없으면 날짜 부분을 뺀다', () => {
  assert.deepEqual(describePriceInsight({ ...base, lowestPriceDate: null, verdict: 'ABOVE_LOWEST' }),
    { tone: 'neutral', text: '최저가보다 5,000원 높음 (최저 24,900원)' });
});

test('가격이 비어 있으면 보여주지 않는다', () => {
  assert.equal(describePriceInsight({ ...base, lowestPrice: null, verdict: 'ABOVE_LOWEST' }), null);
  assert.equal(describePriceInsight({ ...base, currentPrice: null, verdict: 'ABOVE_LOWEST' }), null);
  assert.equal(describePriceInsight({ ...base, lowestPrice: null, verdict: 'NEAR_LOWEST' }), null);
});

test('알 수 없는 판정 값은 보여주지 않는다', () => {
  assert.equal(describePriceInsight({ ...base, verdict: 'SOMETHING_NEW' }), null);
});

test('어떤 문구에도 "역대"를 쓰지 않는다', () => {
  for (const verdict of ['NO_CHANGE', 'LOWEST', 'NEAR_LOWEST', 'ABOVE_LOWEST']) {
    assert.ok(!describePriceInsight({ ...base, verdict }).text.includes('역대'));
  }
});
