// 익명 사용자 ID 생성·보관 규칙을 검증합니다. (실행: node --experimental-strip-types --test 'tests/*.test.mjs')
import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientId, CLIENT_ID_STORAGE_KEY } from '../utils/clientId.ts';

// 호출 기록을 남기는 가짜 저장소
function fakeStorage(initial = {}, { failGet = false, failSet = false } = {}) {
  const data = { ...initial };
  const sets = [];
  return {
    sets,
    getItem(key) {
      if (failGet) throw new Error('blocked');
      return key in data ? data[key] : null;
    },
    setItem(key, value) {
      if (failSet) throw new Error('blocked');
      sets.push([key, value]);
      data[key] = value;
    },
  };
}

test('저장된 ID가 있으면 그대로 돌려준다', () => {
  const storage = fakeStorage({ [CLIENT_ID_STORAGE_KEY]: 'abc' });
  assert.equal(getClientId(storage, () => 'unused'), 'abc');
  assert.equal(storage.sets.length, 0);
});

test('없으면 만들어 저장한다', () => {
  const storage = fakeStorage();
  assert.equal(getClientId(storage, () => 'new-id'), 'new-id');
  assert.deepEqual(storage.sets, [['mion_client_id', 'new-id']]);
});

test('128자를 넘는 저장값은 버리고 새로 만든다', () => {
  const storage = fakeStorage({ [CLIENT_ID_STORAGE_KEY]: 'x'.repeat(129) });
  assert.equal(getClientId(storage, () => 'fresh'), 'fresh');
  assert.deepEqual(storage.sets, [['mion_client_id', 'fresh']]);
});

test('getItem이 예외를 던지면 null', () => {
  assert.equal(getClientId(fakeStorage({}, { failGet: true }), () => 'id'), null);
});

test('setItem이 예외를 던지면 null', () => {
  assert.equal(getClientId(fakeStorage({}, { failSet: true }), () => 'id'), null);
});

test('storage 인자가 없고 window가 없으면 null', () => {
  assert.equal(getClientId(), null);
});
