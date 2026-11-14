// 목표 가격 입력 해석을 검증합니다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTargetPrice } from '../utils/targetPrice.ts';

test('숫자, 쉼표, 공백, "원"을 받아들인다', () => {
  for (const input of ['25000', ' 25,000 ', '25,000원', '25000 원']) {
    assert.deepEqual(parseTargetPrice(input, 29900), { ok: true, value: 25000 }, input);
  }
});

test('빈 입력', () => {
  for (const input of ['', '   ']) {
    assert.deepEqual(parseTargetPrice(input, 29900), { ok: false, reason: '목표 가격을 입력해 주세요.' });
  }
});

test('숫자가 아닌 입력', () => {
  for (const input of ['abc', '2만5천', '25000.5', '-100', '1e5', '원']) {
    assert.deepEqual(parseTargetPrice(input, 29900), { ok: false, reason: '숫자만 입력해 주세요.' }, input);
  }
});

test('0은 받지 않는다', () => {
  assert.deepEqual(parseTargetPrice('0', 29900), { ok: false, reason: '목표 가격은 0보다 커야 합니다.' });
});

test('현재가 이상은 받지 않는다 (저장 즉시 알림이 생기므로)', () => {
  for (const input of ['29900', '30000']) {
    assert.deepEqual(parseTargetPrice(input, 29900),
      { ok: false, reason: '현재가(29,900원)보다 낮은 가격만 설정할 수 있습니다.' });
  }
});

test('현재가 바로 아래는 받는다', () => {
  assert.deepEqual(parseTargetPrice('29899', 29900), { ok: true, value: 29899 });
});
