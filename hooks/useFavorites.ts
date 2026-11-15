/**
 * hooks/useFavorites.ts - 찜(관심상품) 상태를 관리하는 커스텀 훅
 *
 * ═══════════════════════════════════════════════════════════════
 * 이 훅이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 찜 목록을 보여주고, 추가·제거하고, 서버의 관심상품과 맞춥니다.
 *
 * 저장 위치가 두 곳입니다.
 * - 서버 관심상품(/api/v1/watchlist): 기준입니다. 가격 알림은 여기 등록된 상품에만 옵니다.
 * - 브라우저 localStorage: 첫 화면을 빨리 그리기 위한 사본이자, 서버에 아직 못 올린 찜의 임시 보관소입니다.
 *
 * 흐름:
 * 1) 마운트하면 로컬 사본으로 먼저 그립니다(네트워크를 기다리지 않음).
 * 2) 서버 목록을 받아 비교하고, 로컬에만 있는 찜을 하나씩 서버에 등록합니다(utils/favoriteSync.ts가 계획을 계산).
 * 3) 화면 목록을 서버 기준으로 바꿉니다. 일시 오류로 못 올린 찜은 로컬에 남겨 다음 접속에 다시 시도합니다.
 *
 * localStorage를 쓸 수 없는 브라우저에서는 서버 기능을 쓰지 않고 메모리 안의 찜으로만 동작합니다.
 *
 * Java/Spring 비유: 캐시(로컬)와 원본 DB(서버)를 두고, 캐시를 먼저 보여준 뒤 원본으로 갱신하는
 * cache-aside 패턴과 비슷합니다.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiProduct, Product, StoredFavoriteProduct, WatchlistItem } from '../types';
import { normalizeProduct } from '../utils/productNormalization';
import { ApiRequestError } from '../utils/api';
import { classifyUploadFailure, planFavoriteSync, withoutPendingRemovals } from '../utils/favoriteSync';
import { addToWatchlist, getWatchlist, isUserFeatureAvailable, removeFromWatchlist } from '../utils/userApi';

/** 찜 사본을 보관하는 localStorage 키 (기존 사용자의 찜을 잃지 않도록 이름을 유지합니다) */
const FAVORITES_STORAGE_KEY = 'mat_project_favorites';

/** 서버 등록을 확인한 상품 ID 목록을 보관하는 키. "다른 곳에서 지운 찜"과 "아직 못 올린 찜"을 구분합니다. */
const SYNCED_STORAGE_KEY = 'mion_favorites_synced';

const TOGGLE_FAILED_MESSAGE = '찜 상태를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';

type FavoriteItem = StoredFavoriteProduct;

/** 상품을 저장용 찜 항목으로 바꿉니다. 이미 찜 항목이면 추가 시각을 유지합니다. */
const toFavoriteItem = (product: Product | FavoriteItem): FavoriteItem => {
  const normalized = normalizeProduct(product as ApiProduct);
  const existingAddedAt = 'addedAt' in product && typeof product.addedAt === 'string'
    ? product.addedAt
    : undefined;
  return {
    ...normalized,
    addedAt: existingAddedAt || new Date().toISOString(),
  };
};

/** 서버 관심상품을 화면용 찜 항목으로 바꿉니다. 상품 정보는 서버의 최신 값을 씁니다. */
const fromWatchlistItem = (item: WatchlistItem): FavoriteItem => ({
  ...normalizeProduct(item.product),
  addedAt: item.addedAt || new Date().toISOString(),
});

/** 서버 등록을 확인한 ID 목록을 읽습니다. 저장소를 쓸 수 없으면 빈 목록입니다. */
const readSyncedIds = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SYNCED_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const writeSyncedIds = (ids: Iterable<string>): void => {
  try {
    localStorage.setItem(SYNCED_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // 저장 실패는 다음 동기화에서 다시 계산되므로 무시합니다.
  }
};

interface UseFavoritesReturn {
  favorites: FavoriteItem[];  // 찜한 상품 목록
  toggleFavorite: (product: Product | FavoriteItem) => void; // 찜 추가/제거
  isFavorite: (productId: string | number) => boolean; // 찜 여부 확인
  getFavoriteCount: () => number; // 찜한 상품 수
  /** 서버 관심상품 항목(알림 조건 포함). 서버에 아직 없거나 기능을 쓸 수 없으면 undefined */
  getWatchlistItem: (productId: string | number) => WatchlistItem | undefined;
  /** 서버와 다시 맞춥니다. */
  refresh: () => Promise<void>;
  /** 서버가 돌려준 관심상품 항목을 바로 반영합니다(알림 조건을 저장한 직후). */
  applyWatchlistItem: (item: WatchlistItem) => void;
  /** 사용자에게 보여줄 안내·오류 문구. 없으면 null */
  lastError: string | null;
  clearError: () => void;
  isInitialized: boolean; // 로컬 사본 로드 완료 여부
}

export default function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<Record<string, WatchlistItem>>({});
  const [lastError, setLastError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 비동기 작업 안에서 "지금의" 찜 목록을 읽기 위한 참조입니다(클로저에 갇힌 옛 값을 피함).
  const favoritesRef = useRef<FavoriteItem[]>([]);
  // 동기화가 동시에 두 번 돌지 않게 막습니다(개발 모드의 effect 이중 실행 포함).
  const syncingRef = useRef(false);
  // 동기화 도중 사용자가 찜을 바꿨는지 알아내기 위한 카운터입니다.
  const mutationRef = useRef(0);
  // 서버 삭제가 아직 끝나지 않은 상품. 그사이 받은 서버 목록에 남아 있어도 화면에 되살리지 않습니다.
  const pendingRemovalsRef = useRef<Set<string>>(new Set());
  // 상품별 서버 요청을 순서대로 보내기 위한 대기열. 찜 직후 바로 해제해도 등록 → 삭제 순서가 지켜집니다.
  const operationChainsRef = useRef<Map<string, Promise<unknown>>>(new Map());

  /** 같은 상품에 대한 요청을 앞선 요청이 끝난 뒤에 보냅니다. */
  const enqueue = useCallback(<T,>(productId: string, operation: () => Promise<T>): Promise<T> => {
    const previous = operationChainsRef.current.get(productId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(operation);
    operationChainsRef.current.set(productId, next);
    return next;
  }, []);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  /** 서버 목록을 받아 로컬 찜과 맞춥니다. */
  const refresh = useCallback(async (): Promise<void> => {
    if (syncingRef.current || !isUserFeatureAvailable()) {
      return;
    }
    syncingRef.current = true;
    const mutationAtStart = mutationRef.current;
    let goneCount = 0;

    try {
      let serverItems: WatchlistItem[];
      try {
        serverItems = await getWatchlist();
      } catch {
        return; // 서버에 닿지 못하면 로컬 사본을 그대로 씁니다. 오류는 표시하지 않습니다.
      }

      const localBefore = favoritesRef.current;
      const syncedIds = new Set(readSyncedIds());
      const plan = planFavoriteSync(
        localBefore.map((favorite) => favorite.id),
        serverItems.map((item) => item.productId),
        Array.from(syncedIds)
      );

      // 로컬에만 있는 찜을 순서대로 하나씩 올립니다. 서버는 (사용자, 상품)당 한 건만 허용하므로 다시 보내도 중복되지 않습니다.
      const uploaded: WatchlistItem[] = [];
      const retryIds = new Set<string>();
      for (const productId of plan.toUpload) {
        try {
          uploaded.push(await addToWatchlist(productId));
        } catch (error) {
          const status = error instanceof ApiRequestError ? error.status : undefined;
          if (classifyUploadFailure(status) === 'gone') {
            goneCount += 1; // 서버에서 사라진 상품: 다시 시도하지 않고 정리합니다.
          } else {
            retryIds.add(productId); // 일시 오류: 로컬에 남겨 다음 접속에 다시 시도합니다.
          }
        }
      }

      // 동기화 도중 사용자가 찜을 바꿨다면 이번 결과로 덮어쓰지 않고 처음부터 다시 맞춥니다.
      if (mutationRef.current !== mutationAtStart) {
        syncingRef.current = false;
        await refresh();
        return;
      }

      // 삭제 요청이 진행 중인 상품은 서버 목록에 아직 있어도 제외합니다.
      const allServerItems = withoutPendingRemovals([...serverItems, ...uploaded], pendingRemovalsRef.current);
      const nextFavorites = [
        ...allServerItems.map(fromWatchlistItem),
        ...localBefore.filter((favorite) => retryIds.has(favorite.id)),
      ];
      plan.removedElsewhere.forEach((id) => syncedIds.delete(id));
      allServerItems.forEach((item) => syncedIds.add(item.productId));

      writeSyncedIds(syncedIds);
      setWatchlistItems(Object.fromEntries(allServerItems.map((item) => [item.productId, item])));
      setFavorites(nextFavorites);
      if (goneCount > 0) {
        setLastError(`판매가 끝난 상품 ${goneCount}개를 찜 목록에서 정리했습니다`);
      }
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // 1) 마운트: 로컬 사본으로 먼저 그린 뒤 서버와 맞춥니다.
  useEffect(() => {
    let loaded: FavoriteItem[] = [];
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          loaded = parsed
            .filter((item): item is ApiProduct & { addedAt?: unknown } => {
              return Boolean(item && typeof item === 'object' && item.id !== undefined && item.id !== null);
            })
            .map((item) => ({
              ...normalizeProduct(item),
              addedAt: typeof item.addedAt === 'string' ? item.addedAt : new Date().toISOString(),
            }));
        }
      }
    } catch {
      loaded = []; // 손상된 사본이나 접근 불가: 빈 목록으로 시작합니다.
    }
    favoritesRef.current = loaded;
    setFavorites(loaded);
    setIsInitialized(true);
    void refresh();
  }, [refresh]);

  // 2) 찜 목록이 바뀔 때마다 로컬 사본을 갱신합니다.
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // 저장소를 쓸 수 없어도 화면 동작은 계속합니다.
    }
  }, [favorites, isInitialized]);

  /**
   * 찜을 추가하거나 제거합니다.
   * 화면을 먼저 바꾸고 서버에 알립니다. 서버가 거절하면 화면을 되돌리고 이유를 알립니다.
   */
  const toggleFavorite = useCallback(
    (product: Product | FavoriteItem) => {
      if (!product || product.id === undefined || product.id === null) {
        return;
      }
      const productId = String(product.id);
      const existing = favoritesRef.current.find((favorite) => favorite.id === productId);
      const serverEnabled = isUserFeatureAvailable();
      mutationRef.current += 1;

      if (existing) {
        setFavorites((previous) => previous.filter((favorite) => favorite.id !== productId));
        if (!serverEnabled) {
          return;
        }
        pendingRemovalsRef.current.add(productId);
        enqueue(productId, () => removeFromWatchlist(productId))
          .then(() => {
            writeSyncedIds(readSyncedIds().filter((id) => id !== productId));
            setWatchlistItems((previous) => {
              const next = { ...previous };
              delete next[productId];
              return next;
            });
          })
          .catch(() => {
            // 되돌리기: 그사이 다시 찜하지 않았을 때만 복원합니다.
            setFavorites((previous) =>
              previous.some((favorite) => favorite.id === productId) ? previous : [...previous, existing]
            );
            setLastError(TOGGLE_FAILED_MESSAGE);
          })
          .finally(() => {
            pendingRemovalsRef.current.delete(productId);
          });
        return;
      }

      const favoriteItem = toFavoriteItem(product);
      setFavorites((previous) =>
        previous.some((favorite) => favorite.id === productId) ? previous : [...previous, favoriteItem]
      );
      if (!serverEnabled) {
        return;
      }
      enqueue(productId, () => addToWatchlist(productId))
        .then((item) => {
          writeSyncedIds([...readSyncedIds(), productId]);
          setWatchlistItems((previous) => ({ ...previous, [productId]: item }));
        })
        .catch(() => {
          setFavorites((previous) => previous.filter((favorite) => favorite.id !== productId));
          setLastError(TOGGLE_FAILED_MESSAGE);
        });
    },
    [enqueue]
  );

  const isFavorite = useCallback(
    (productId: string | number): boolean => {
      const normalizedId = String(productId);
      return favorites.some((favorite) => favorite.id === normalizedId);
    },
    [favorites]
  );

  const getFavoriteCount = useCallback((): number => favorites.length, [favorites]);

  const getWatchlistItem = useCallback(
    (productId: string | number): WatchlistItem | undefined => watchlistItems[String(productId)],
    [watchlistItems]
  );

  const clearError = useCallback(() => setLastError(null), []);

  const applyWatchlistItem = useCallback((item: WatchlistItem) => {
    setWatchlistItems((previous) => ({ ...previous, [item.productId]: item }));
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    getWatchlistItem,
    refresh,
    applyWatchlistItem,
    lastError,
    clearError,
    isInitialized,
  };
}
