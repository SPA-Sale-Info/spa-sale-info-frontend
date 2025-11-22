import { useState, useEffect, useCallback } from 'react'

const RECENTLY_VIEWED_KEY = 'spa_sale_recently_viewed'
const MAX_RECENT_ITEMS = 10

/**
 * 최근 본 상품을 관리하는 커스텀 훅
 * 
 * @description
 * 사용자가 상세 페이지에서 조회한 상품들을 로컬 스토리지(localStorage)에 저장하고 관리합니다.
 * 서버 DB를 사용하지 않고 브라우저 저장소를 활용하여 "최근 본 상품" 기능을 가볍게 구현했습니다.
 */
export default function useRecentlyViewed() {
    // recentItems: 화면에 보여줄 최근 본 상품 목록 상태
    const [recentItems, setRecentItems] = useState([])

    // isInitialized: 로컬 스토리지에서 데이터를 불러왔는지 여부 (Hydration Mismatch 방지)
    const [isInitialized, setIsInitialized] = useState(false)

    // 초기 로드: 컴포넌트 마운트 시 로컬 스토리지에서 데이터를 읽어옵니다.
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENTLY_VIEWED_KEY)
            if (stored) {
                setRecentItems(JSON.parse(stored))
            }
        } catch (error) {
            console.error('최근 본 상품 로드 실패:', error)
        } finally {
            setIsInitialized(true)
        }
    }, [])

    // 상품 추가 함수
    // useCallback을 사용하여 불필요한 함수 재생성을 방지합니다.
    const addRecentItem = useCallback((product) => {
        if (!product || !product.id) return

        setRecentItems((prev) => {
            // 중복 제거: 이미 목록에 있는 상품이라면 일단 제거하고 맨 앞으로 다시 추가합니다.
            const filtered = prev.filter((item) => item.id !== product.id)

            // 저장할 데이터 최소화: 로컬 스토리지 용량 절약을 위해 필요한 정보만 객체로 만듭니다.
            const newItem = {
                id: product.id,
                name: product.name,
                brand: product.brand || product.brandName,
                salePrice: product.salePrice || product.price,
                originalPrice: product.originalPrice,
                discountRate: product.discountRate,
                imageUrl: product.imageUrl,
                viewedAt: new Date().toISOString(), // 언제 봤는지 기록
            }

            // 새 목록 생성: 새 상품을 맨 앞에 두고, 최대 개수(MAX_RECENT_ITEMS)만큼만 유지합니다.
            const newItems = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS)

            // 상태 업데이트와 동시에 로컬 스토리지에도 저장합니다.
            try {
                localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems))
            } catch (error) {
                console.error('최근 본 상품 저장 실패:', error)
            }

            return newItems
        })
    }, [])

    return {
        recentItems,
        addRecentItem,
        isInitialized,
    }
}
