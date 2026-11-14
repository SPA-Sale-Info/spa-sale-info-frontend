/**
 * utils/userApi.ts - 사용자별 기능(관심상품·알림)과 상품 부가 정보 API
 *
 * utils/api.ts가 "모두에게 같은" 상품 데이터를 다룬다면, 이 파일은 "이 브라우저의 사용자"에 묶인 데이터를 다룹니다.
 * 사용자별 요청에는 익명 ID를 X-Mion-Client-Id 헤더로 붙입니다(utils/clientId.ts).
 *
 * 경로는 모두 상대 경로(/api/v1/...)입니다. 브라우저의 요청은 next.config.js의 rewrite를 거쳐
 * 백엔드로 전달되므로 같은 출처 요청이 됩니다. 이 함수들은 브라우저에서만 호출합니다.
 */

import type {
  AlertSettings,
  NotificationItem,
  PagedResponse,
  PriceInsight,
  SimilarProducts,
  WatchlistItem,
} from '../types';
import { ApiRequestError, fetchAPI } from './api';
import { getClientId } from './clientId';

/** 백엔드가 익명 사용자를 구분하는 헤더 이름 */
const CLIENT_ID_HEADER = 'X-Mion-Client-Id';

/** 알림함 한 페이지 크기 */
export const NOTIFICATION_PAGE_SIZE = 20;

/** 비슷한 상품 기본 개수 */
export const SIMILAR_PRODUCTS_LIMIT = 8;

/**
 * 관심상품·알림 기능을 쓸 수 있는 환경인지 확인합니다.
 * localStorage가 막힌 브라우저에서는 false이며, 화면은 관련 UI를 그리지 않아야 합니다.
 */
export function isUserFeatureAvailable(): boolean {
  return getClientId() !== null;
}

/** 익명 ID 헤더를 만듭니다. ID를 만들 수 없으면 요청을 보내지 않고 오류를 던집니다. */
function userHeaders(): Record<string, string> {
  const clientId = getClientId();
  if (!clientId) {
    throw new ApiRequestError('사용자 식별자를 만들 수 없습니다');
  }
  return { [CLIENT_ID_HEADER]: clientId };
}

/** 상품 ID를 경로에 안전하게 넣습니다. */
const productPath = (productId: string): string => encodeURIComponent(productId);

// ── 관심상품 ────────────────────────────────────────────────────────────────

export function getWatchlist(): Promise<WatchlistItem[]> {
  return fetchAPI<WatchlistItem[]>('/api/v1/watchlist', { headers: userHeaders() });
}

export function addToWatchlist(productId: string): Promise<WatchlistItem> {
  return fetchAPI<WatchlistItem>(`/api/v1/watchlist/${productPath(productId)}`, {
    method: 'POST',
    headers: userHeaders(),
  });
}

export async function removeFromWatchlist(productId: string): Promise<void> {
  // 삭제 응답의 data는 null이므로 값을 돌려주지 않습니다.
  await fetchAPI<null>(`/api/v1/watchlist/${productPath(productId)}`, {
    method: 'DELETE',
    headers: userHeaders(),
  });
}

/** 알림 조건을 통째로 교체합니다. 서버는 저장 직후 이 상품의 조건을 바로 평가합니다. */
export function updateAlertSettings(productId: string, settings: AlertSettings): Promise<WatchlistItem> {
  return fetchAPI<WatchlistItem>(`/api/v1/watchlist/${productPath(productId)}/alerts`, {
    method: 'PUT',
    headers: userHeaders(),
    body: JSON.stringify(settings),
  });
}

// ── 알림 ────────────────────────────────────────────────────────────────────

/** 알림 목록. 서버가 최신순으로 정렬하므로 page와 size만 보냅니다. */
export function getNotifications(
  page: number,
  size: number = NOTIFICATION_PAGE_SIZE
): Promise<PagedResponse<NotificationItem>> {
  return fetchAPI<PagedResponse<NotificationItem>>(`/api/v1/notifications?page=${page}&size=${size}`, {
    headers: userHeaders(),
  });
}

export async function getUnreadCount(): Promise<number> {
  const result = await fetchAPI<{ unreadCount: number }>('/api/v1/notifications/unread-count', {
    headers: userHeaders(),
  });
  return result.unreadCount;
}

export function markNotificationRead(notificationId: string): Promise<NotificationItem> {
  return fetchAPI<NotificationItem>(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
    headers: userHeaders(),
  });
}

// ── 상품 부가 정보 (사용자와 무관하므로 헤더 없음) ─────────────────────────────

export function getPriceInsight(productId: string): Promise<PriceInsight> {
  return fetchAPI<PriceInsight>(`/api/v1/products/${productPath(productId)}/price-insight`);
}

export function getSimilarProducts(
  productId: string,
  limit: number = SIMILAR_PRODUCTS_LIMIT
): Promise<SimilarProducts> {
  return fetchAPI<SimilarProducts>(`/api/v1/products/${productPath(productId)}/similar?limit=${limit}`);
}
