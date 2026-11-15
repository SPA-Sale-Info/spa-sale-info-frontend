// 사진 검색의 파일 검사, 축소 크기 계산, 응답 → 화면 상태 변환을 검증합니다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateImageFile, fitWithin, describeDetection, describeSearchOutcome, describeSearchFailure, CATEGORY_FILTERS, MAX_UPLOAD_BYTES,
} from '../utils/imageSearch.ts';

test('이미지 파일만, 15MB 이하만 받는다', () => {
  assert.deepEqual(validateImageFile({ type: 'image/jpeg', size: 1000 }), { ok: true });
  assert.deepEqual(validateImageFile({ type: 'image/png', size: MAX_UPLOAD_BYTES }), { ok: true });
  assert.deepEqual(validateImageFile({ type: 'application/pdf', size: 1000 }),
    { ok: false, reason: '이미지 파일만 올릴 수 있습니다.' });
  assert.deepEqual(validateImageFile({ type: '', size: 1000 }),
    { ok: false, reason: '이미지 파일만 올릴 수 있습니다.' });
  assert.deepEqual(validateImageFile({ type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1 }),
    { ok: false, reason: '사진이 너무 큽니다. 15MB 이하의 사진을 올려 주세요.' });
  assert.deepEqual(validateImageFile({ type: 'image/jpeg', size: 0 }),
    { ok: false, reason: '빈 파일입니다. 다른 사진을 선택해 주세요.' });
});

test('긴 변이 1024를 넘으면 비율을 지켜 줄이고, 작은 사진은 키우지 않는다', () => {
  assert.deepEqual(fitWithin(4000, 3000, 1024), { width: 1024, height: 768 });
  assert.deepEqual(fitWithin(3000, 4000, 1024), { width: 768, height: 1024 });
  assert.deepEqual(fitWithin(800, 600, 1024), { width: 800, height: 600 });
  assert.deepEqual(fitWithin(5000, 10, 1024), { width: 1024, height: 2 });
  assert.deepEqual(fitWithin(1, 9000, 1024), { width: 1, height: 1024 });
});

test('결과가 있으면 목록 상태', () => {
  const items = [{ product: { id: 'a' }, score: 0.8 }];
  assert.deepEqual(describeSearchOutcome({ strategy: 'IMAGE', modelVersion: 'm', items, unavailableReason: null }),
    { kind: 'results' });
});

test('사용 불가 사유별 안내', () => {
  const base = { strategy: 'IMAGE', modelVersion: null, items: [] };
  assert.deepEqual(describeSearchOutcome({ ...base, unavailableReason: 'DISABLED' }),
    { kind: 'unavailable', message: '지금은 사진 검색을 쓸 수 없습니다.', retryable: false });
  assert.deepEqual(describeSearchOutcome({ ...base, unavailableReason: 'SEARCH_ERROR' }),
    { kind: 'unavailable', message: '검색에 실패했습니다. 잠시 후 다시 시도해 주세요.', retryable: true });
  assert.deepEqual(describeSearchOutcome({ ...base, unavailableReason: 'NO_MATCH' }),
    { kind: 'empty', message: '비슷한 세일 상품을 찾지 못했습니다. 다른 사진이나 필터로 다시 찾아보세요.' });
  // 사유 없이 비어 있거나 모르는 사유는 결과 없음으로 다룬다
  assert.equal(describeSearchOutcome({ ...base, unavailableReason: null }).kind, 'empty');
  assert.equal(describeSearchOutcome({ ...base, unavailableReason: 'SOMETHING_NEW' }).kind, 'empty');
});

test('요청 실패의 상태 코드별 안내', () => {
  assert.deepEqual(describeSearchFailure(429),
    { kind: 'unavailable', message: '요청이 많습니다. 잠시 후 다시 시도해 주세요.', retryable: true });
  assert.deepEqual(describeSearchFailure(400, '이미지를 읽을 수 없습니다. 다른 사진으로 시도해 주세요.'),
    { kind: 'unavailable', message: '이미지를 읽을 수 없습니다. 다른 사진으로 시도해 주세요.', retryable: false });
  assert.deepEqual(describeSearchFailure(413),
    { kind: 'unavailable', message: '사진이 너무 큽니다. 다른 사진으로 시도해 주세요.', retryable: false });
  for (const status of [500, 502, 403, undefined]) {
    assert.deepEqual(describeSearchFailure(status),
      { kind: 'unavailable', message: '검색에 실패했습니다. 잠시 후 다시 시도해 주세요.', retryable: true });
  }
});

test('분류 필터는 "전체"로 시작하고 가방·신발은 세부 분류로 찾는다', () => {
  assert.deepEqual(CATEGORY_FILTERS[0], { label: '전체' });
  assert.deepEqual(CATEGORY_FILTERS.find((f) => f.label === '가방'), { label: '가방', subCategory: 'BAG' });
  assert.deepEqual(CATEGORY_FILTERS.find((f) => f.label === '신발'), { label: '신발', subCategory: 'SHOES' });
  assert.deepEqual(CATEGORY_FILTERS.find((f) => f.label === '아우터'), { label: '아우터', mainCategory: 'OUTER' });
  // 어떤 문구에도 근거 없는 일치율 표현을 쓰지 않는다
  const all = JSON.stringify([describeSearchFailure(500), CATEGORY_FILTERS]);
  assert.ok(!/일치|%/.test(all));
});

// ── 웹에서 찾은 SPA 브랜드 상품 ───────────────────────────────────────────────
import { describeWebOutcome, describeWebFailure, safeHttpUrl } from '../utils/imageSearch.ts';

test('웹 결과가 있으면 목록, 기능이 꺼져 있으면 영역을 숨긴다', () => {
  const item = { brandType: 'ZARA', brandName: 'ZARA', title: '백', pageUrl: 'https://www.zara.com/a', imageUrl: null };
  assert.deepEqual(describeWebOutcome({ items: [item], unavailableReason: null }), { kind: 'results' });
  assert.deepEqual(describeWebOutcome({ items: [], unavailableReason: 'DISABLED' }), { kind: 'hidden' });
});

test('웹 결과가 없을 때의 사유별 안내', () => {
  assert.deepEqual(describeWebOutcome({ items: [], unavailableReason: 'NO_MATCH' }),
    { kind: 'note', message: '웹에서는 비슷한 SPA 브랜드 상품을 찾지 못했습니다.' });
  assert.deepEqual(describeWebOutcome({ items: [], unavailableReason: 'QUOTA_EXCEEDED' }),
    { kind: 'note', message: '이번 달 웹 검색 한도를 모두 사용했습니다.' });
  assert.deepEqual(describeWebOutcome({ items: [], unavailableReason: 'SEARCH_ERROR' }),
    { kind: 'note', message: '웹 검색에 실패했습니다.' });
  assert.equal(describeWebOutcome({ items: [], unavailableReason: null }).kind, 'note');
});

test('웹 검색 요청 실패 안내', () => {
  assert.deepEqual(describeWebFailure(429), { kind: 'note', message: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' });
  assert.deepEqual(describeWebFailure(500), { kind: 'note', message: '웹 검색에 실패했습니다.' });
  // 이 기능이 없는 서버(404)에서는 영역을 숨긴다
  assert.deepEqual(describeWebFailure(404), { kind: 'hidden' });
});

test('외부에서 온 주소는 http(s)만 링크·이미지로 쓴다', () => {
  assert.equal(safeHttpUrl('https://www.zara.com/kr/a?x=1'), 'https://www.zara.com/kr/a?x=1');
  assert.equal(safeHttpUrl('http://example.com/a'), 'http://example.com/a');
  for (const url of ['javascript:alert(1)', 'data:text/html,<script>', '//evil.example/x', 'ftp://a/b', '', null, undefined, 'not a url']) {
    assert.equal(safeHttpUrl(url), null, String(url));
  }
});

test('인식한 종류와 넓혀 찾은 범위를 안내한다', () => {
  const base = { strategy: 'IMAGE', modelVersion: 'm', items: [], unavailableReason: null };
  assert.equal(describeDetection(base), null);
  assert.equal(describeDetection({ ...base, detectedCategory: 'SOMETHING_NEW' }), null);
  assert.match(describeDetection({ ...base, detectedCategory: 'SHIRT', widenedTo: null }), /셔츠만 찾았습니다/);
  assert.match(describeDetection({ ...base, detectedCategory: 'SHIRT', widenedTo: 'TOP' }), /상의 전체에서/);
});
