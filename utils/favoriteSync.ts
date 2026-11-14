/**
 * utils/favoriteSync.ts - 로컬 찜을 서버 관심상품으로 옮기는 규칙 (순수 함수)
 *
 * 찜은 원래 브라우저 localStorage에만 있었습니다. 이제 서버 관심상품이 기준이 되므로,
 * 로컬에만 남아 있는 찜을 서버에 올려야 합니다. 여기에는 "무엇을 올릴지"를 정하는 계산만 두고,
 * 실제 네트워크 호출은 hooks/useFavorites.ts가 합니다.
 *
 * 이 파일은 Node 내장 테스트 러너가 그대로 실행하므로 다른 모듈을 import 하지 않습니다.
 */

/** 동기화 계획 */
export interface FavoriteSyncPlan {
  /** 서버에 새로 등록할 상품 ID (로컬 순서 유지, 중복 없음) */
  toUpload: string[];
  /** 전에 서버에 올렸지만 지금은 서버에 없는 ID. 다른 기기·탭에서 지운 것이므로 로컬에서도 뺍니다. */
  removedElsewhere: string[];
}

/**
 * 로컬 찜과 서버 관심상품을 비교해 할 일을 정합니다.
 *
 * @param localIds  로컬에 저장된 찜의 상품 ID
 * @param serverIds 서버 관심상품의 상품 ID
 * @param syncedIds 이 브라우저가 서버 등록을 확인한 적 있는 상품 ID
 */
export function planFavoriteSync(localIds: string[], serverIds: string[], syncedIds: string[]): FavoriteSyncPlan {
  const onServer = new Set(serverIds);
  const synced = new Set(syncedIds);
  const seen = new Set<string>();
  const toUpload: string[] = [];
  const removedElsewhere: string[] = [];

  for (const id of localIds) {
    if (seen.has(id) || onServer.has(id)) {
      continue; // 중복이거나 이미 서버에 있음
    }
    seen.add(id);
    if (synced.has(id)) {
      removedElsewhere.push(id);
    } else {
      toUpload.push(id);
    }
  }

  return { toUpload, removedElsewhere };
}

/**
 * 서버 등록 실패를 분류합니다.
 * - 'gone':  상품이 서버에서 사라짐(404). 다시 시도해도 소용없으므로 찜에서 정리합니다.
 * - 'retry': 네트워크·서버 일시 오류. 로컬에 남겨 두고 다음 접속에 다시 시도합니다.
 */
export function classifyUploadFailure(status: number | undefined): 'gone' | 'retry' {
  return status === 404 ? 'gone' : 'retry';
}

/**
 * 삭제 요청이 아직 끝나지 않은 상품을 서버 목록에서 뺍니다.
 *
 * 찜을 해제하면 화면에서는 바로 사라지지만 서버의 DELETE는 조금 뒤에 끝납니다. 그사이 받아 온 서버 목록에는
 * 그 상품이 아직 남아 있을 수 있는데, 그대로 믿으면 방금 해제한 찜이 화면에 되살아납니다.
 */
export function withoutPendingRemovals<T extends { productId: string }>(
  serverItems: T[],
  pendingRemovalIds: ReadonlySet<string>
): T[] {
  return pendingRemovalIds.size === 0
    ? serverItems
    : serverItems.filter((item) => !pendingRemovalIds.has(item.productId));
}

/**
 * 목록 뒤에 다음 페이지를 이어 붙이되, 이미 있는 id는 건너뜁니다.
 * 첫 페이지를 본 뒤 새 항목이 생기면 다음 페이지에 이미 본 항목이 다시 올 수 있기 때문입니다.
 */
export function appendUniqueById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !seen.has(item.id))];
}
