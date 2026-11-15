/**
 * utils/clientId.ts - 로그인 없는 익명 사용자 식별자
 *
 * 관심상품·알림 API는 "누구의 것인지"를 알아야 합니다. 로그인 대신, 브라우저가 처음 접속할 때
 * 추측하기 어려운 ID를 하나 만들어 localStorage에 보관하고 요청마다 X-Mion-Client-Id 헤더로 보냅니다.
 *
 * 주의:
 * - 이 파일은 Node 내장 테스트 러너가 타입만 지우고 그대로 실행합니다. 그래서 다른 모듈을 import 하지 않고,
 *   지울 수 있는 타입 문법만 씁니다(enum, namespace 금지).
 * - 사생활 보호 모드처럼 localStorage 접근이 막히면 null을 돌려줍니다. 호출하는 쪽은 null이면
 *   관심상품·알림 기능을 끄고 기존 로컬 찜 동작으로 남아야 합니다.
 */

/** localStorage에 익명 ID를 보관하는 키 */
export const CLIENT_ID_STORAGE_KEY = 'mion_client_id';

/** 백엔드(ClientIdentityResolver)가 허용하는 최대 길이 */
const MAX_CLIENT_ID_LENGTH = 128;

/** getClientId가 쓰는 저장소의 최소 모양 (테스트에서 가짜 저장소를 넣기 위해 분리) */
type ClientIdStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * 익명 ID를 돌려줍니다. 없으면 만들어 저장합니다.
 *
 * @param storage  기본값은 브라우저의 localStorage
 * @param generate 기본값은 crypto.randomUUID
 * @returns ID 문자열. 브라우저가 아니거나 저장소를 쓸 수 없으면 null
 */
export function getClientId(storage?: ClientIdStorage, generate?: () => string): string | null {
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!target) {
      return null; // 서버 렌더링 중이거나 저장소가 없는 환경
    }

    const stored = target.getItem(CLIENT_ID_STORAGE_KEY);
    if (stored && stored.trim() && stored.length <= MAX_CLIENT_ID_LENGTH) {
      return stored;
    }

    const create = generate ?? (() => crypto.randomUUID());
    const created = create();
    target.setItem(CLIENT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    // 접근 자체가 예외를 던지는 브라우저 설정(쿠키·저장소 차단)에서는 기능을 끕니다.
    return null;
  }
}
