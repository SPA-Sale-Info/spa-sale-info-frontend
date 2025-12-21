/**
 * useRecentlyViewed.ts
 *
 * 최근 본 상품을 관리하는 커스텀 훅 (TypeScript 버전)
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';

const RECENTLY_VIEWED_KEY = 'spa_sale_recently_viewed';
const MAX_RECENT_ITEMS = 10;

// 최근 본 상품 아이템 타입
interface RecentlyViewedItem {
  id: number;
  name: string;
  brand: string;
  salePrice: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl: string;
  viewedAt: string;
}

// 훅의 반환 타입
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
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('최근 본 상품 로드 실패:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  /**
   * 상품 추가 함수
   */
  const addRecentItem = useCallback((product: Product) => {
    if (!product || !product.id) return;

    setRecentItems((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);

      const newItem: RecentlyViewedItem = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        salePrice: product.salePrice,
        originalPrice: product.originalPrice,
        discountRate: product.discountRate,
        imageUrl: product.imageUrl,
        viewedAt: new Date().toISOString(),
      };

      const newItems = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);

      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
      } catch (error) {
        console.error('최근 본 상품 저장 실패:', error);
      }

      return newItems;
    });
  }, []);

  return {
    recentItems,
    addRecentItem,
    isInitialized,
  };
}
