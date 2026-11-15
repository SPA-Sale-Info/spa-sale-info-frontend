// 로컬 찜을 서버 관심상품으로 옮기는 계획과 실패 분류를 검증합니다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planFavoriteSync, classifyUploadFailure } from '../utils/favoriteSync.ts';

test('서버에 없는 로컬 찜만 올린다', () => {
  assert.deepEqual(planFavoriteSync(['a', 'b', 'c'], ['b'], []), { toUpload: ['a', 'c'], removedElsewhere: [] });
});

test('전에 올렸는데 서버에서 사라진 찜은 다시 올리지 않고 로컬에서 뺀다', () => {
  assert.deepEqual(planFavoriteSync(['a', 'b'], [], ['a']), { toUpload: ['b'], removedElsewhere: ['a'] });
});

test('로컬 중복은 한 번만 올린다', () => {
  assert.deepEqual(planFavoriteSync(['a', 'a'], [], []).toUpload, ['a']);
});

test('로컬이 비어 있으면 할 일이 없다', () => {
  assert.deepEqual(planFavoriteSync([], ['x'], []), { toUpload: [], removedElsewhere: [] });
});

test('이미 서버에 있는 찜은 동기화 기록이 있어도 그대로 둔다', () => {
  assert.deepEqual(planFavoriteSync(['a'], ['a'], ['a']), { toUpload: [], removedElsewhere: [] });
});

test('404만 영구 실패로 본다', () => {
  assert.equal(classifyUploadFailure(404), 'gone');
  for (const status of [500, 503, 400, 0, undefined]) {
    assert.equal(classifyUploadFailure(status), 'retry');
  }
});

// ── 리뷰 지적 보완 ───────────────────────────────────────────────────────────
import { withoutPendingRemovals, appendUniqueById } from '../utils/favoriteSync.ts';

test('삭제 요청이 진행 중인 상품은 서버 목록에 아직 있어도 화면 목록에서 뺀다', () => {
  const server = [{ productId: 'a' }, { productId: 'b' }, { productId: 'c' }];
  assert.deepEqual(withoutPendingRemovals(server, new Set(['b'])), [{ productId: 'a' }, { productId: 'c' }]);
  assert.deepEqual(withoutPendingRemovals(server, new Set()), server);
});

test('다음 페이지를 이어 붙일 때 이미 있는 항목은 다시 넣지 않는다', () => {
  const merged = appendUniqueById([{ id: '1' }, { id: '2' }], [{ id: '2' }, { id: '3' }]);
  assert.deepEqual(merged.map((item) => item.id), ['1', '2', '3']);
});
