/**
 * useRecentlyViewed.ts
 *
 * 최근 본 상품을 관리하는 커스텀 훅 (TypeScript 버전)
 *
 * TypeScript 문법 포인트:
 * - interface는 객체 구조를 정의합니다.
 * - useState<타입>으로 상태의 타입을 고정합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';

// localStorage에 저장할 키와 최대 저장 개수
const RECENTLY_VIEWED_KEY = 'spa_sale_recently_viewed';
const MAX_RECENT_ITEMS = 10;

// 최근 본 상품 아이템 타입 (저장에 필요한 최소한의 정보)
interface RecentlyViewedItem {
  id: string;
  name: string;
  brand: string;
  salePrice: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl: string;
  viewedAt: string;
}

// 훅의 반환 타입 (이 훅을 쓰는 쪽에서 받는 값/함수)
interface UseRecentlyViewedReturn {
  recentItems: RecentlyViewedItem[];
  addRecentItem: (product: Product) => void;
  isInitialized: boolean;
}

/**
 * 최근 본 상품을 관리하는 커스텀 훅
 */
export default function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 초기 로드: 컴포넌트 마운트 시 로컬 스토리지에서 데이터를 읽어옵니다.
   * useEffect는 "처음 렌더 시" 실행됩니다.
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((item) => item && item.id !== undefined && item.id !== null)
            .map((item) => ({
              ...item,
              id: String(item.id),
            }));
          setRecentItems(normalized);
        }
      }
    } catch {} finally {
      setIsInitialized(true);
    }
  }, []);

  /**
   * 상품 추가 함수
   * useCallback으로 함수 재생성을 줄여 성능을 개선합니다.
   */
  const addRecentItem = useCallback((product: Product) => {
    if (!product || product.id === undefined || product.id === null) return;
    const productId = String(product.id);

    setRecentItems((prev) => {
      // 이미 본 상품은 제거하여 가장 최근이 맨 앞에 오도록 처리
      const filtered = prev.filter((item) => item.id !== productId);

      // 저장할 최소 필드를 구성
      const newItem: RecentlyViewedItem = {
        id: productId,
        name: product.name,
        brand: product.brand,
        salePrice: product.salePrice,
        originalPrice: product.originalPrice,
        discountRate: product.discountRate,
        imageUrl: product.imageUrl,
        viewedAt: new Date().toISOString(),
      };

      // 최대 개수 제한을 유지
      const newItems = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);

      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
      } catch {}

      return newItems;
    });
  }, []);

  // 훅 사용자에게 제공하는 값들
  return {
    recentItems,
    addRecentItem,
    isInitialized,
  };
}
