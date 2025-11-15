/**
 * useFavorites.js
 *
 * 찜/북마크 기능을 위한 커스텀 훅
 * LocalStorage를 활용하여 사용자가 좋아하는 상품을 저장하고 관리합니다.
 *
 * 주요 기능:
 * 1. 찜 목록 조회 (getFavorites)
 * 2. 찜 추가/제거 토글 (toggleFavorite)
 * 3. 특정 상품이 찜되어 있는지 확인 (isFavorite)
 * 4. 찜 목록 전체 가져오기 (favorites)
 */

import { useState, useEffect, useCallback } from 'react'

// LocalStorage 키 상수 정의
const FAVORITES_STORAGE_KEY = 'mat_project_favorites'

/**
 * useFavorites - 찜 기능 관리 커스텀 훅
 *
 * @returns {Object} 찜 관련 함수와 상태
 * - favorites: 현재 찜한 상품 ID 배열
 * - toggleFavorite: 찜 추가/제거 함수
 * - isFavorite: 특정 상품이 찜되어 있는지 확인하는 함수
 * - getFavoriteProducts: 찜한 상품의 전체 정보 배열 반환
 * - clearFavorites: 모든 찜 삭제
 */
export function useFavorites() {
  // 찜한 상품 ID 목록을 상태로 관리
  const [favorites, setFavorites] = useState([])
  // 초기 로드 완료 여부를 추적
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * LocalStorage에서 찜 목록을 불러오는 함수
   * 컴포넌트 마운트 시 한 번만 실행
   */
  useEffect(() => {
    try {
      // LocalStorage에서 데이터 가져오기
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        // JSON 파싱하여 상태에 저장
        const parsed = JSON.parse(stored)
        // 배열인지 확인 후 설정 (데이터 무결성 체크)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (error) {
      // JSON 파싱 에러 등 예외 처리
      console.error('찜 목록을 불러오는 중 오류 발생:', error)
      // 오류 발생 시 빈 배열로 초기화
      setFavorites([])
    } finally {
      // 로드 완료 표시
      setIsInitialized(true)
    }
  }, []) // 빈 의존성 배열 = 컴포넌트 마운트 시 한 번만 실행

  /**
   * LocalStorage에 찜 목록을 저장하는 함수
   * favorites 상태가 변경될 때마다 실행
   * 단, 초기 로드가 완료된 후에만 실행
   */
  useEffect(() => {
    // 초기 로드가 완료되지 않았으면 저장하지 않음
    if (!isInitialized) {
      return
    }

    try {
      // 상태를 JSON 문자열로 변환하여 LocalStorage에 저장
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('찜 목록을 저장하는 중 오류 발생:', error)
    }
  }, [favorites, isInitialized]) // favorites 또는 isInitialized가 변경될 때마다 실행

  /**
   * toggleFavorite - 찜 추가/제거 토글 함수
   *
   * @param {Object} product - 찜할 상품 객체 (최소한 id, name, price, imageUrl 포함)
   *
   * 동작:
   * - 이미 찜되어 있으면 제거
   * - 찜되어 있지 않으면 추가 (상품 기본 정보만 저장)
   */
  const toggleFavorite = useCallback((product) => {
    if (!product || !product.id) {
      console.error('유효하지 않은 상품 데이터입니다.')
      return
    }

    // 현재 상태에서 이미 존재하는지 먼저 확인
    const alreadyExists = favorites.some((fav) => fav.id === product.id)

    if (alreadyExists) {
      // 이미 찜되어 있으면 제거
      setFavorites((prevFavorites) => {
        return prevFavorites.filter((fav) => fav.id !== product.id)
      })
    } else {
      // 찜되어 있지 않으면 추가
      // 필요한 데이터만 저장하여 LocalStorage 용량 절약
      const favoriteItem = {
        id: product.id,
        name: product.name,
        brand: product.brand || product.brandCode,
        brandCode: product.brandCode || product.brand,
        brandName: product.brandName || product.brand,
        price: product.price || product.salePrice,
        salePrice: product.salePrice || product.price,
        originalPrice: product.originalPrice,
        discountRate: product.discountRate,
        imageUrl: product.imageUrl,
        productUrl: product.productUrl,
        gender: product.gender,
        mainCategory: product.mainCategory || product.category,
        vibeTags: product.vibeTags || [],
        addedAt: new Date().toISOString(), // 찜한 시간 기록
      }
      setFavorites((prevFavorites) => {
        // 추가하기 전에 한 번 더 체크 (race condition 방지)
        if (prevFavorites.some((fav) => fav.id === product.id)) {
          return prevFavorites
        }
        return [...prevFavorites, favoriteItem]
      })
    }
  }, [favorites])

  /**
   * isFavorite - 특정 상품이 찜되어 있는지 확인
   *
   * @param {string} productId - 확인할 상품 ID
   * @returns {boolean} 찜되어 있으면 true, 아니면 false
   */
  const isFavorite = useCallback(
    (productId) => {
      return favorites.some((fav) => fav.id === productId)
    },
    [favorites]
  )

  /**
   * getFavoriteProducts - 찜한 상품 전체 정보 반환
   *
   * @returns {Array} 찜한 상품 객체 배열
   */
  const getFavoriteProducts = useCallback(() => {
    return favorites
  }, [favorites])

  /**
   * clearFavorites - 모든 찜 삭제
   */
  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  /**
   * getFavoriteCount - 찜한 상품 개수 반환
   *
   * @returns {number} 찜한 상품 개수
   */
  const getFavoriteCount = useCallback(() => {
    return favorites.length
  }, [favorites])

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteProducts,
    clearFavorites,
    getFavoriteCount,
  }
}

export default useFavorites
