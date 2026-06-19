/**
 * pages/index.tsx - 메인 페이지 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * ARCA 앱의 메인 화면입니다. URL "/" 에 해당합니다.
 * 상품 목록 표시, 필터(브랜드/성별/카테고리), 검색, 무한 스크롤을 담당합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * Next.js 페이지 파일이란?
 * ═══════════════════════════════════════════════════════════════
 * pages/ 폴더 안의 파일은 자동으로 URL 경로가 됩니다 (파일 기반 라우팅).
 * pages/index.tsx → http://localhost:3000/ (루트 경로)
 * pages/about.tsx → http://localhost:3000/about
 * 별도 라우터 설정 없이 파일 위치만으로 URL이 결정됩니다.
 *
 * Java/Spring 비유:
 * @Controller 클래스에서 @GetMapping("/")으로 루트 경로 처리하는 것과 같습니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 핵심 React 훅 정리
 * ═══════════════════════════════════════════════════════════════
 * useState<T>   : 변하는 값(상태)을 관리합니다. 값이 바뀌면 자동으로 화면이 재렌더됩니다.
 * useEffect     : 사이드 이펙트(API 호출, 이벤트 등록 등)를 처리합니다.
 * useMemo       : 비싼 계산 결과를 캐싱합니다. 의존성이 바뀔 때만 재계산합니다.
 * useRef        : DOM 요소 참조 또는 렌더 없이 값을 저장하는 "변경 가능한 상자"입니다.
 * useCallback   : 함수를 캐싱합니다. 의존성이 바뀔 때만 재생성합니다.
 *
 * Java/Spring 비유:
 * useState  ≈ @Getter/@Setter 필드 (단, 변경 시 View가 자동 갱신)
 * useEffect ≈ @PostConstruct, @EventListener
 * useMemo   ≈ @Cacheable
 * useRef    ≈ ThreadLocal 또는 instance 변수 (렌더와 무관하게 유지)
 * useCallback ≈ @Cacheable 메서드 (함수 자체를 캐싱)
 */

// React의 내장 훅들을 가져옵니다.
// useState, useEffect 등은 react 패키지에 포함된 함수들입니다.
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import BrandFilter from '../components/BrandFilter'
import GenderFilter from '../components/GenderFilter'
import CategoryFilter from '../components/CategoryFilter'
import DetailedFilters from '../components/DetailedFilters'
import SortDropdown from '../components/SortDropdown'
import ThemeToggle from '../components/ThemeToggle'
import ProductCard from '../components/ProductCard'
import CompareTray from '../components/CompareTray'
import SEO from '../components/SEO'
import styles from '../styles/Home.module.css'
import { ApiRequestError, fetchSaleProducts, fetchSaleProductCount } from '../utils/api'
import { normalizeProducts } from '../utils/productNormalization'
import { parseSearchQuery, isActiveBrand } from '../utils/parseSearchQuery'
import useFavorites from '../hooks/useFavorites'
import useCompare from '../hooks/useCompare'
import { SORT_OPTIONS, DEFAULT_SORT_VALUE } from '../types'
import type { Brand, Gender, Category, NormalizedProduct } from '../types'
import { DAILY_INSIGHTS, DAILY_MOODS } from '../constants/dailyContent'

/**
 * PAGE_SIZE - 한 번에 불러올 상품 수
 *
 * 값이 너무 작으면(예: 4) 스크롤을 조금만 내려도 계속 API를 호출합니다.
 * 값이 너무 크면(예: 100) 첫 로딩이 느립니다.
 * 12는 3열 그리드 4행 = 한 화면에 적당한 수입니다.
 *
 * Java 비유: private static final int PAGE_SIZE = 12;
 */
const PAGE_SIZE = 12



/**
 * Home - 메인 페이지 컴포넌트
 *
 * `export default function Home()`:
 * - export default: Next.js가 이 파일을 페이지로 사용하려면 반드시 기본 내보내기가 있어야 합니다.
 * - function Home(): 함수형 컴포넌트 선언 (클래스 컴포넌트보다 간결하고 현대적인 방식)
 * - 이 함수가 반환하는 JSX가 화면에 그려집니다.
 */
export default function Home() {
  /**
   * ═══════════════════════════════════════════════════════════════
   * 상태(State) 변수 선언 — useState
   * ═══════════════════════════════════════════════════════════════
   * const [현재값, 변경함수] = useState<타입>(초기값)
   *
   * - 현재값: 지금의 상태 값
   * - 변경함수(set...): 호출하면 상태가 바뀌고 컴포넌트가 다시 렌더됩니다.
   * - <타입>: TypeScript 제네릭으로 이 상태가 어떤 타입인지 명시합니다.
   *   → 잘못된 타입의 값을 전달하면 컴파일 에러가 발생합니다.
   * - 초기값: 컴포넌트가 처음 생성될 때의 기본 값
   *
   * Java 비유:
   * private NormalizedProduct[] products = new NormalizedProduct[0]; // useState([] )와 같음
   * public void setProducts(NormalizedProduct[] p) { this.products = p; rerender(); }
   */

  // 화면에 표시할 상품 목록 (NormalizedProduct 배열)
  // 빈 배열([])로 시작하여 API 응답이 오면 채워집니다.
  const [products, setProducts] = useState<NormalizedProduct[]>([])

  // 필터 상태들
  // Brand | 'all': 특정 브랜드 또는 '전체'(all) 중 하나
  // 초기값 'all': 처음에는 모든 브랜드 표시
  const [selectedBrand, setSelectedBrand] = useState<Brand | 'all'>('all')
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0)       // 최소 할인율 (0 = 전체)
  const [selectedPrice, setSelectedPrice] = useState<number>(Infinity)      // 최대 가격 (Infinity = 전체)

  // sortValue: 정렬 옵션의 value (예: 'discount_desc'). 기본값은 할인율 높은순.
  // SORT_OPTIONS(types/index.ts)에서 정의한 value 중 하나를 가집니다.
  const [sortValue, setSortValue] = useState<string>(DEFAULT_SORT_VALUE)

  // excludeSoldOut: true이면 품절 상품(inStock === false)을 목록에서 제외합니다.
  const [excludeSoldOut, setExcludeSoldOut] = useState<boolean>(false)

  // 로딩 상태들
  // isInitialLoading: 첫 데이터 로딩 중 (전체 화면 스켈레톤 표시)
  // isFetchingMore: 무한 스크롤로 추가 데이터 로딩 중 (하단 작은 스켈레톤 표시)
  // 두 상태를 분리하는 이유: 각각 다른 UI를 보여주기 위해
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true)
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false)

  // error: null이면 에러 없음, 문자열이면 에러 메시지
  // string | null: TypeScript에서 "문자열 또는 null" 중 하나를 허용하는 유니온 타입
  const [error, setError] = useState<string | null>(null)

  // 페이지네이션 상태
  // hasMore: 더 불러올 데이터가 있는지 (false이면 스크롤해도 더 로드 안 함)
  // page: 현재 페이지 번호 (0부터 시작, Spring Pageable과 동일)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(0)

  // 검색 상태
  // searchInput: 입력창에 타이핑 중인 값 (실시간 반영)
  // searchKeyword: 실제 검색에 사용되는 값 (폼 제출 시에만 업데이트)
  // 두 상태를 분리하는 이유: 타이핑할 때마다 API를 호출하지 않기 위해
  const [searchInput, setSearchInput] = useState<string>('')
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  // UI 표시 상태들
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)  // "맨 위로" 버튼 표시
  const [showFilters, setShowFilters] = useState<boolean>(false)      // 필터 패널 표시
  const [logoStep, setLogoStep] = useState<number>(0)                 // 로고 애니메이션 단계 (0~3)

  // navScrolled: 스크롤이 10px 이상이면 nav에 border-bottom을 표시합니다.
  // 스크롤 이벤트에서 window.scrollY > 10이면 true로 설정합니다.
  const [navScrolled, setNavScrolled] = useState<boolean>(false)

  // highlights: 메인 상단 "최대 할인율 TOP" 가로 스트립에 보여줄 상품들
  // 메인 그리드의 필터와 무관하게, 진입 시 한 번만 "할인율 높은순" 상위 상품을 가져옵니다.
  const [highlights, setHighlights] = useState<NormalizedProduct[]>([])

  // 세일 상품 총 개수 (헤더의 "X개 할인 중" 표시용)
  const [totalSaleCount, setTotalSaleCount] = useState<number>(0)
  // animatedCount: totalSaleCount까지 숫자가 올라가는 카운터 애니메이션용
  const [animatedCount, setAnimatedCount] = useState<number>(0)

  /**
   * useRef — 렌더링 없이 값을 유지하는 "변경 가능한 상자"
   * ─────────────────────────────────────────────────────────
   * useState와 달리, useRef의 값이 바뀌어도 컴포넌트가 다시 렌더되지 않습니다.
   * 두 가지 용도:
   * 1. DOM 요소 참조: ref.current로 실제 HTML 요소에 접근
   * 2. 렌더와 무관한 값 저장: 이전 스크롤 위치 등
   *
   * useRef<HTMLDivElement | null>(null):
   * - <HTMLDivElement | null>: ref가 가리킬 요소 타입 (div 또는 null)
   * - null: 초기값 (아직 DOM에 연결 전)
   * - JSX에서 ref={loadMoreRef}로 연결하면 loadMoreRef.current에 실제 요소가 담깁니다.
   *
   * Java 비유: private volatile Element loadMoreElement; (스레드 안전한 참조)
   */

  // loadMoreRef: 무한 스크롤 감지용 sentinel 요소 (화면 하단에 숨겨진 div)
  // IntersectionObserver가 이 요소가 화면에 보이면 다음 페이지를 로드합니다.
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // filterPanelRef: 필터 패널 DOM 요소 참조 (스크롤 행동 제어용)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)

  // sectionHeaderRef: "맨 위로 이동" 버튼 클릭 시 스크롤 목표 위치
  const sectionHeaderRef = useRef<HTMLDivElement | null>(null)

  // lastScrollY: 이전 스크롤 Y 위치 저장 (방향 감지용, 렌더 없이 저장)
  const lastScrollY = useRef<number>(0)

  // Next.js 라우터 — 필터 상태를 URL 쿼리스트링과 동기화하는 데 사용합니다.
  const router = useRouter()

  // didHydrateFromUrl: URL → 상태 초기화를 "한 번만" 수행하기 위한 플래그입니다.
  // (router.isReady 시점에 쿼리를 읽어 상태에 반영하고, 이후에는 상태 → URL 방향만 동기화)
  const didHydrateFromUrl = useRef<boolean>(false)

  // 찜 기능 훅
  const { toggleFavorite, isFavorite, getFavoriteCount } = useFavorites()

  // 상품 비교 훅 (최대 4개, localStorage 저장)
  const {
    compareItems,
    toggleCompare,
    removeCompare,
    clearCompare,
    isComparing,
    isFull: isCompareFull,
  } = useCompare()
  const dailyMood = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const index = Number(todayKey) % DAILY_MOODS.length
    return DAILY_MOODS[index]
  }, [])

  const dailyInsight = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const index = Number(todayKey) % DAILY_INSIGHTS.length
    return DAILY_INSIGHTS[index]
  }, [])

  // 로고 애니메이션: 1200ms마다 logoStep 0→1→2→3 순환
  // S(ales) / S·P(roduct) / S·P·A(rchive) 순서로 단어가 펼쳐집니다.
  useEffect(() => {
    const timer = setInterval(() => {
      setLogoStep(prev => (prev + 1) % 4)
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  // 총 할인 상품 개수 가져오기 (헤더에 표시되는 숫자용)
  useEffect(() => {
    const loadSaleCount = async () => {
      const count = await fetchSaleProductCount()
      setTotalSaleCount(count)
    }
    loadSaleCount()
  }, [])

  // 상단 "최대 할인율 TOP" 스트립용 데이터 — 진입 시 한 번만 로드합니다.
  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const response = await fetchSaleProducts({
          page: 0,
          size: 10,
          sortBy: 'discount',
          sortDirection: 'desc',
        })
        setHighlights(normalizeProducts(response.products ?? []))
      } catch {
        // 스트립은 부가 기능이므로 실패해도 조용히 무시합니다(메인 그리드에 영향 없음).
        setHighlights([])
      }
    }
    loadHighlights()
  }, [])

  // 카운트 애니메이션: totalSaleCount가 바뀌면 숫자를 서서히 증가시킵니다.
  useEffect(() => {
    if (totalSaleCount === 0) return undefined

    const duration = 2000 // 2초 동안 애니메이션
    const steps = 60
    const increment = totalSaleCount / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep += 1
      if (currentStep >= steps) {
        setAnimatedCount(totalSaleCount)
        clearInterval(timer)
      } else {
        setAnimatedCount(Math.floor(increment * currentStep))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalSaleCount])

  const mergeUniqueProducts = useCallback((prevProducts: NormalizedProduct[], incomingProducts: NormalizedProduct[], replace: boolean) => {
    if (replace) {
      return incomingProducts
    }

    const seenIds = new Set(prevProducts.map(product => product.id))
    const merged = [...prevProducts]

    incomingProducts.forEach((product) => {
      if (product.id && !seenIds.has(product.id)) {
        seenIds.add(product.id)
        merged.push(product)
      }
    })

    return merged
  }, [])

  /**
   * 실질적으로 데이터를 가져오는 함수입니다.
   * - replace가 true면 기존 목록을 갈아끼우고(브랜드 변경 등),
   * - false면 무한 스크롤처럼 목록 뒤에 이어 붙입니다.
   */
  // useCallback의 인자에 타입을 직접 지정해, 함수가 받는 값의 구조를 명확히 합니다.
  const loadProducts = useCallback(async ({ pageToLoad, replace }: { pageToLoad: number; replace: boolean }) => {
    if (replace) {
      setIsInitialLoading(true)
      setError(null)
    } else {
      setIsFetchingMore(true)
    }

    try {
      // 현재 정렬 옵션을 찾습니다. value가 유효하지 않으면 첫 번째(기본) 옵션을 사용합니다.
      const currentSort = SORT_OPTIONS.find(option => option.value === sortValue) ?? SORT_OPTIONS[0]

      // fetchSaleProducts는 이제 { products, totalPages, hasMore, ... } 형식을 반환합니다
      const response = await fetchSaleProducts({
        page: pageToLoad,
        size: PAGE_SIZE,
        brands: selectedBrand !== 'all' ? [selectedBrand] : undefined,
        genders: selectedGender !== 'all' ? [selectedGender] : undefined,
        categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
        keyword: searchKeyword || undefined,
        maxPrice: Number.isFinite(selectedPrice) ? selectedPrice : undefined,
        minDiscountRate: selectedDiscount > 0 ? selectedDiscount : undefined,
        // 정렬 기준/방향을 서버에 전달합니다 (전체 데이터 기준 정렬).
        sortBy: currentSort.sortBy,
        sortDirection: currentSort.sortDirection,
      })

      // response.products 배열을 정규화합니다
      const apiProducts = response.products ?? []
      const normalized = normalizeProducts(apiProducts)

      // 기존 상품 목록에 병합하거나 교체합니다
      setProducts(prev => mergeUniqueProducts(prev, normalized, replace))
      setPage(pageToLoad)

      // 백엔드에서 제공하는 페이지네이션 정보(hasMore)를 사용합니다
      setHasMore(response.hasMore)
    } catch (err) {
      const message = (err as Error)?.message || ''
      const isNotFoundError =
        (err instanceof ApiRequestError && err.status === 404) ||
        message.includes('status: 404') ||
        /not\s+found/i.test(message)

      if (replace && isNotFoundError) {
        setError('NO_RESULTS')
        setHasMore(false)
        setProducts([])
      } else {
        setError(replace
          ? '상품 정보를 가져오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          : '추가 상품을 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        )
        setHasMore(false)
        if (replace) {
          setProducts([])
        }
      }
    } finally {
      if (replace) {
        setIsInitialLoading(false)
      } else {
        setIsFetchingMore(false)
      }
    }
  }, [mergeUniqueProducts, searchKeyword, selectedBrand, selectedCategory, selectedGender, selectedDiscount, selectedPrice, sortValue])

  /**
   * 필터/정렬/검색이 바뀌면
   * 1) 목록을 비우고
   * 2) 첫 페이지(0페이지)를 다시 불러옵니다.
   *
   * loadProducts는 useCallback으로 위 의존성(브랜드/성별/카테고리/할인율/가격/검색어/정렬)이
   * 바뀔 때마다 새로 생성되므로, 이 effect도 그때마다 재실행됩니다.
   */
  useEffect(() => {
    setProducts([])
    setPage(0)
    setHasMore(true)
    loadProducts({ pageToLoad: 0, replace: true })
  }, [loadProducts])

  /**
   * 클라이언트 사이드 "표시 필터링" 로직
   *
   * ⚠️ 변경 이력(중요):
   * 이전에는 브랜드/성별/카테고리/할인율/가격/검색어를 클라이언트에서 한 번 더 걸렀습니다.
   * 그러나 이 조건들은 이미 서버(fetchSaleProducts 파라미터)가 필터링해서 내려줍니다.
   * 클라이언트가 다시 거르면 두 가지 문제가 생겼습니다.
   *   1) 중복 로직(서버/클라 동시 관리) → 유지보수 어려움
   *   2) 서버가 내려준 12개를 클라가 0개로 걸러 무한 스크롤이 멈추는 버그
   * 그래서 서버가 책임지는 필터는 클라이언트에서 제거하고,
   * 여기서는 "순수하게 화면 표시에만 필요한 최소 필터"만 남깁니다.
   *   - hasValidImage: 깨진 이미지 URL을 가진 상품은 카드 품질을 위해 숨김
   *   - excludeSoldOut: 사용자가 "품절 제외" 토글을 켰을 때만 품절 상품 숨김
   */
  // useMemo: products / excludeSoldOut가 바뀔 때만 재계산
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 깨진 이미지 URL 방어 (undefined/null 문자열이 섞인 경우 제외)
      const hasValidImage = Boolean(product.imageUrl)
        && !product.imageUrl.includes('undefined')
        && !product.imageUrl.includes('null')

      // "품절 제외" 토글이 켜져 있으면, 재고가 명시적으로 false인 상품을 숨깁니다.
      // (inStock이 undefined = 재고 정보 없음 → 숨기지 않음)
      const passesSoldOut = !excludeSoldOut || product.inStock !== false

      return hasValidImage && passesSoldOut
    })
  }, [products, excludeSoldOut])

  const filteredCountRef = useRef(0)
  useEffect(() => {
    filteredCountRef.current = filteredProducts.length
  }, [filteredProducts.length])

  /**
   * loadNextPage - 다음 페이지 로드 조건을 체크하고 loadProducts를 호출하는 함수
   *
   * 무한 스크롤에서 IntersectionObserver가 이 함수를 호출합니다.
   *
   * 로드하지 않는 조건:
   * - isInitialLoading: 첫 로딩 중이면 스킵
   * - isFetchingMore: 이미 추가 로딩 중이면 스킵 (중복 요청 방지)
   * - !hasMore: 더 불러올 데이터가 없으면 스킵
   * - filteredCountRef.current === 0: 화면에 상품이 없으면 스킵
   *
   * page + 1: 다음 페이지 번호 (0-indexed)
   * replace: false: 기존 목록에 추가 (교체하지 않음)
   */
  const loadNextPage = useCallback(() => {
    if (
      isInitialLoading ||
      isFetchingMore ||
      !hasMore ||
      filteredCountRef.current === 0
    ) {
      return
    }

    loadProducts({ pageToLoad: page + 1, replace: false })
  }, [hasMore, isFetchingMore, isInitialLoading, loadProducts, page])

  /**
   * IntersectionObserver 설정 — 무한 스크롤 구현
   * ─────────────────────────────────────────────────────────
   * IntersectionObserver란?
   * 특정 DOM 요소가 뷰포트(사용자 화면)에 들어오거나 나가는 것을 감지하는 브라우저 API입니다.
   * scroll 이벤트와 달리 성능이 좋습니다:
   * - scroll 이벤트: 스크롤할 때마다 계속 호출 (초당 수십~수백 번)
   * - IntersectionObserver: 요소가 뷰포트와 교차하는 순간만 콜백 호출
   *
   * Java 비유: Observer 패턴 — loadMoreRef 요소가 보이면 이벤트 발생
   *
   * 동작 방식:
   * 1. 상품 목록 맨 아래에 보이지 않는 div(loadMoreRef)를 배치합니다.
   * 2. IntersectionObserver가 이 div를 감시합니다.
   * 3. 사용자가 스크롤하여 이 div가 화면에 들어오면 → loadNextPage() 호출
   * 4. 다음 페이지 데이터를 로드하여 목록에 추가합니다.
   *
   * useEffect 의존성: [loadNextPage]
   * → loadNextPage 함수가 바뀔 때마다 Observer를 새로 설정합니다.
   *
   * cleanup 함수: return () => observer.unobserve(target)
   * → 컴포넌트가 사라지거나 의존성이 바뀌면 이전 Observer를 해제합니다.
   * → 메모리 누수 방지를 위해 필수입니다.
   * → Java의 @PreDestroy 또는 try-with-resources와 유사합니다.
   *
   * rootMargin: '400px 0px':
   * - 상하로 400px의 여유를 두고 미리 트리거합니다.
   * - 요소가 실제로 보이기 400px 전에 이미 다음 페이지를 로드합니다.
   * - 사용자가 스크롤 하단에 도달하기 전에 미리 데이터를 불러와 자연스러운 무한 스크롤을 만듭니다.
   *
   * threshold: 0.1:
   * - 요소의 10%가 뷰포트에 들어오면 콜백을 실행합니다.
   * - 0이면 1px만 보여도, 1이면 100% 다 보여야 실행됩니다.
   */
  useEffect(() => {
    // loadMoreRef.current가 null이면 (DOM 요소가 없으면) 아무것도 하지 않음
    if (!loadMoreRef.current) {
      return undefined
    }

    // IntersectionObserver 생성
    // entries: 관찰 중인 요소들의 교차 상태 배열 (여기서는 요소 1개)
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries // 배열 구조분해 할당으로 첫 번째 항목만 꺼냄
        if (entry.isIntersecting) {
          // 요소가 뷰포트에 들어왔을 때 다음 페이지 로드
          loadNextPage()
        }
      },
      {
        rootMargin: '400px 0px', // 상하 400px 여유 (미리 로드)
        threshold: 0.1,          // 10% 이상 보이면 트리거
      },
    )

    const target = loadMoreRef.current
    observer.observe(target) // 요소 감시 시작

    // cleanup 함수: 이 Effect가 다시 실행되거나 컴포넌트가 unmount될 때 실행
    // observer.unobserve(target): 해당 요소 감시 중단
    return () => observer.unobserve(target)
  }, [loadNextPage])

  /**
   * [제거됨] 화면 채우기 강제 로드 effect
   *
   * 이전에는 "products.length < PAGE_SIZE * 2"인 동안 다음 페이지를 강제로 더 불러왔습니다.
   * 이는 클라이언트 과잉 필터링으로 화면이 비던 시절의 땜빵이었습니다.
   * 이제 서버 필터링이 정확하므로, 콘텐츠가 짧으면 하단 sentinel(loadMoreRef)이
   * 처음부터 뷰포트에 들어와 IntersectionObserver가 자연스럽게 다음 페이지를 로드합니다.
   * → 중복 호출 위험을 줄이기 위해 이 effect를 제거했습니다.
   */

  // 브랜드, 성별, 검색어 변경 핸들러
  const handleBrandChange = (brand: Brand | 'all') => {
    setSelectedBrand(brand)
  }

  const handleGenderChange = (gender: Gender | 'all') => {
    setSelectedGender(gender)
  }

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category)
  }

  const handleDiscountChange = (discount: number) => {
    setSelectedDiscount(discount)
  }

  const handlePriceChange = (price: number) => {
    setSelectedPrice(price)
  }

  // 정렬 변경 핸들러: 정렬 값이 바뀌면 loadProducts가 재생성되어 자동으로 0페이지부터 다시 로드됩니다.
  const handleSortChange = (value: string) => {
    setSortValue(value)
  }

  // "품절 제외" 토글 핸들러 (클라이언트 표시 필터, 서버 재요청 없음)
  const handleToggleSoldOut = () => {
    setExcludeSoldOut(prev => !prev)
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * 필터 상태 ↔ URL 쿼리스트링 동기화 (#3)
   * ═══════════════════════════════════════════════════════════════
   * 왜 필요한가요?
   * - 필터를 걸어둔 화면을 그대로 "공유/북마크"할 수 있습니다.
   *   예: /?brand=ZARA&sort=price_asc&minDiscount=30
   * - 새로고침/뒤로가기 시에도 필터가 유지됩니다.
   *
   * 동기화 방향은 두 가지입니다.
   * 1) URL → 상태 (최초 1회): 진입 시 URL의 쿼리를 읽어 상태를 초기화
   * 2) 상태 → URL (이후 계속): 사용자가 필터를 바꾸면 URL을 갱신
   */

  // (1) URL → 상태: router가 준비되면 쿼리를 읽어 상태에 한 번만 반영합니다.
  useEffect(() => {
    // router.isReady: 쿼리 파싱이 끝났는지 여부 (false일 때 query는 비어 있음)
    if (!router.isReady || didHydrateFromUrl.current) {
      return
    }

    // 쿼리 값은 string | string[] | undefined → 첫 값을 문자열로 정규화하는 헬퍼
    const q = router.query
    const getStr = (v: string | string[] | undefined): string => Array.isArray(v) ? v[0] : (v ?? '')

    const brand = getStr(q.brand)
    const gender = getStr(q.gender)
    const category = getStr(q.category)
    const sort = getStr(q.sort)
    const minDiscount = Number(getStr(q.minDiscount))
    const maxPrice = Number(getStr(q.maxPrice))
    const keyword = getStr(q.q)
    const soldout = getStr(q.soldout)

    if (brand) setSelectedBrand(brand as Brand | 'all')
    if (gender) setSelectedGender(gender as Gender | 'all')
    if (category) setSelectedCategory(category as Category | 'all')
    // 유효한 정렬 값일 때만 반영(잘못된 값으로 인한 오작동 방지)
    if (sort && SORT_OPTIONS.some(o => o.value === sort)) setSortValue(sort)
    if (Number.isFinite(minDiscount) && minDiscount > 0) setSelectedDiscount(minDiscount)
    if (Number.isFinite(maxPrice) && maxPrice > 0) setSelectedPrice(maxPrice)
    if (keyword) { setSearchKeyword(keyword); setSearchInput(keyword) }
    if (soldout === 'exclude') setExcludeSoldOut(true)

    // 초기화 완료 표시 → 이후에는 (2) 상태 → URL 방향만 동작합니다.
    didHydrateFromUrl.current = true
  }, [router.isReady, router.query])

  // (2) 상태 → URL: 필터 상태가 바뀔 때마다 URL 쿼리를 갱신합니다.
  useEffect(() => {
    // 아직 URL → 상태 초기화가 끝나지 않았으면, 덮어쓰지 않습니다(초기값으로 URL 날아가는 것 방지).
    if (!didHydrateFromUrl.current) {
      return
    }

    // 기본값과 다른 항목만 쿼리에 담아 URL을 깔끔하게 유지합니다.
    const query: Record<string, string> = {}
    if (selectedBrand !== 'all') query.brand = selectedBrand
    if (selectedGender !== 'all') query.gender = selectedGender
    if (selectedCategory !== 'all') query.category = selectedCategory
    if (sortValue !== DEFAULT_SORT_VALUE) query.sort = sortValue
    if (selectedDiscount > 0) query.minDiscount = String(selectedDiscount)
    if (Number.isFinite(selectedPrice)) query.maxPrice = String(selectedPrice)
    if (searchKeyword) query.q = searchKeyword
    if (excludeSoldOut) query.soldout = 'exclude'

    // shallow: true → 데이터 재요청 없이 URL만 바꿉니다(스크롤/상태 유지).
    // 기존 URL과 동일하면 굳이 replace하지 않아 불필요한 history 변경을 막습니다.
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedGender, selectedCategory, sortValue, selectedDiscount, selectedPrice, searchKeyword, excludeSoldOut])

  // appliedSearchLabels: 자연어 검색에서 해석된 조건 칩들("유니클로", "5만원 이하" 등)
  // 사용자에게 "이렇게 이해했어요"를 시각적으로 피드백하기 위한 상태입니다.
  const [appliedSearchLabels, setAppliedSearchLabels] = useState<string[]>([])

  /**
   * 검색 폼 제출 — 자연어 검색 파싱 적용
   *
   * 입력 문장을 parseSearchQuery로 분석해
   * 브랜드/성별/카테고리/최대가격/최소할인율 필터를 자동으로 채우고,
   * 나머지 텍스트만 일반 검색어로 사용합니다.
   * 예) "5만원 이하 30% 유니클로 니트"
   *   → maxPrice=50000, minDiscount=30, brand=UNIQLO, category=TOP, keyword="니트"
   */
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchInput.trim()

    if (!trimmed) {
      // 빈 검색: 키워드만 비웁니다(다른 필터는 유지).
      setSearchKeyword('')
      setAppliedSearchLabels([])
      return
    }

    const parsed = parseSearchQuery(trimmed)

    // 해석된 필터들을 상태에 반영합니다(없으면 기존 값 유지).
    // 활성 브랜드(세일 데이터 제공)일 때만 브랜드 필터를 적용해 빈 결과를 방지합니다.
    if (parsed.brand && parsed.brand !== 'all' && isActiveBrand(parsed.brand)) {
      setSelectedBrand(parsed.brand)
    }
    if (parsed.gender) setSelectedGender(parsed.gender)
    if (parsed.category) setSelectedCategory(parsed.category)
    if (typeof parsed.maxPrice === 'number') setSelectedPrice(parsed.maxPrice)
    if (typeof parsed.minDiscount === 'number') setSelectedDiscount(parsed.minDiscount)

    // 남은 텍스트를 검색어로 사용하고, 입력창도 정리된 값으로 갱신합니다.
    setSearchKeyword(parsed.keyword)
    setSearchInput(trimmed)
    setAppliedSearchLabels(parsed.appliedLabels)
  }

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setShowScrollTop(currentScrollY > 400)
      // 10px 이상 스크롤 시 nav에 border-bottom 표시
      setNavScrolled(currentScrollY > 10)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    // 섹션 헤더 위치로 스크롤
    if (sectionHeaderRef.current) {
      sectionHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleFilters = () => {
    setShowFilters(prev => !prev)
  }

  // 통계 계산
  const isBrandFilterActive = selectedBrand !== 'all'
  const isNoResultsError = error === 'NO_RESULTS'
  const hasBlockingError = Boolean(error && !isNoResultsError)
  const shouldShowEmptyState = !isInitialLoading && filteredProducts.length === 0 && !hasBlockingError
  const emptyIcon = isBrandFilterActive ? '😔' : '🔍'
  const emptyTitle = isBrandFilterActive ? '현재 할인 중인 옷이 없는 거 같아요' : '상품이 없습니다'
  const emptyDescription = isBrandFilterActive
    ? '다른 브랜드를 선택해 보세요.'
    : '선택하신 조건에 맞는 상품이 아직 없습니다. 다른 필터를 선택해 보세요.'

  return (
    <div className={styles.container}>
      <div className={styles.leftAd}>
        {/* 광고 영역 */}
      </div>
      <div className={styles.mainContent}>
        <SEO
          title="ARCA - H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 세일 정보 | 매일 업데이트"
          description="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 인기 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 세일 정보로 합리적인 쇼핑을 즐기세요."
          canonical="https://mion-spa-info.vercel.app"
          googleSiteVerification="Jq8ncQ8slNfWXuqPL_ZZv8f10qrXEApKFkjkwDsy56k"
          structuredData={[
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ARCA',
              description: 'SPA 브랜드 세일 정보 큐레이션 서비스 - ARCA',
              url: 'https://mion-spa-info.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://mion-spa-info.vercel.app/?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: '할인 중인 SPA 브랜드 상품',
              description: 'H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등의 세일 상품 모음',
              numberOfItems: totalSaleCount || 0,
              itemListElement: filteredProducts.slice(0, 10).map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Product',
                  name: product.name,
                  brand: {
                    '@type': 'Brand',
                    name: product.brandName,
                  },
                  offers: {
                    '@type': 'Offer',
                    price: product.salePrice,
                    priceCurrency: 'KRW',
                    availability: 'https://schema.org/InStock',
                    url: product.productUrl,
                  },
                },
              })),
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ARCA',
              url: 'https://mion-spa-info.vercel.app',
              logo: 'https://mion-spa-info.vercel.app/favicon.ico',
              description: 'ARCA - SPA 브랜드 할인 상품 정보를 제공하는 큐레이션 서비스',
              sameAs: [],
            },
          ]}
        />

        {/* 네비게이션 — Apple HIG sticky glassmorphism nav
            navScrolled 상태에 따라 stickyNavScrolled 클래스를 추가해 하단 border-bottom을 표시합니다.
            3-column grid: [로고] [검색창] [액션] */}
        <header className={`${styles.stickyNav} ${navScrolled ? styles.stickyNavScrolled : ''}`}>
          <div className={styles.navInner}>

            {/* 로고 — ARCA 프리미엄 모노그램 애니메이션
                logoStep 0: "A"만 노출 / logoStep 1~3: "ARCA" 풀네임 노출
                하나의 이니셜에서 브랜드 전체 이름이 펼쳐지는 고급스러운 리빌 효과입니다. */}
            <Link href="/" className={styles.logo}>
              <span className={styles.logoSegment}>
                <span className={styles.logoChar}>A</span>
                <span className={`${styles.logoWord} ${logoStep >= 1 ? styles.logoWordVisible : ''}`}>
                  RCA
                </span>
              </span>
            </Link>

            {/* 검색창 — nav 중앙 배치 (모바일에서는 CSS로 숨김 처리) */}
            <form className={styles.navSearchForm} onSubmit={handleSearchSubmit}>
              <span className={styles.navSearchIcon} aria-hidden="true">🔍</span>
              <input
                type="text"
                name="keyword"
                value={searchInput}
                onChange={handleSearchInputChange}
                className={styles.navSearchInput}
                placeholder="브랜드, 무드, 상품 검색"
                aria-label="상품 검색"
              />
              {/* 검색어가 있을 때만 지우기 버튼 표시 */}
              {searchInput && (
                <button
                  type="button"
                  className={styles.navSearchClear}
                  onClick={() => { setSearchInput(''); setSearchKeyword(''); setAppliedSearchLabels([]); }}
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </form>

            {/* 오른쪽 액션 영역 — 찜 목록 링크 + 테마 토글 */}
            <div className={styles.navActions}>
              <Link href="/favorites" className={styles.navIconBtn} aria-label="찜 목록">
                <span aria-hidden="true">♥</span>
                {getFavoriteCount() > 0 && (
                  <span className={styles.navBadge}>{getFavoriteCount()}</span>
                )}
              </Link>
              <ThemeToggle />
            </div>

          </div>
        </header>

        {/* 히어로 섹션 */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>Sale archive</span>
              <h1 className={styles.heroTitle}>
                흩어진 할인 정보를 한눈에
              </h1>
              <p className={styles.heroSubtitle}>
                돈을 아끼며 무드를 챙기세요.
                <br />
                매일 갱신되는 세일 정보를 한 눈에 확인하세요.
              </p>

              <div className={styles.heroInsights}>
                <div className={styles.heroInsightCard}>
                  <p className={styles.heroInsightLabel}>오늘의 시선</p>
                  <strong>{dailyInsight.theme}</strong>
                  <small>{dailyInsight.tip}</small>
                </div>
                <div className={styles.heroInsightCard}>
                  <p className={styles.heroInsightLabel}>할인 중인 상품</p>
                  <strong className={styles.countNumber}>
                    {(Number.isFinite(animatedCount) ? animatedCount : 0).toLocaleString()}개
                  </strong>
                  <small>매일 갱신되는 세일 정보</small>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div
                className={styles.heroMoodBoard}
                style={{
                  background: dailyMood.background,
                  color: dailyMood.textColor,
                }}
              >
                <p className={styles.heroMoodTitle}>Wardrobe log</p>
                <div className={styles.heroMoodRow}>
                  <span>컬러 힌트</span>
                  <strong>{dailyMood.palette}</strong>
                </div>
                <div className={styles.heroMoodRow}>
                  <span>소재 선택</span>
                  {/* dangerouslySetInnerHTML 제거: fabric은 순수 텍스트이므로 그대로 렌더해도
                      충분하며, 불필요한 XSS 위험 표면을 없앱니다. */}
                  <strong>{dailyMood.fabric}</strong>
                </div>
                <div className={styles.heroMoodRow}>
                  <span>포커스 아이템</span>
                  <strong>{dailyMood.focus}</strong>
                </div>
                <p className={styles.heroMoodNote}>
                  {dailyMood.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 최대 할인율 TOP 스트립 — 가로 스크롤로 "지금 가장 많이 깎인" 상품을 먼저 노출
            메인 그리드의 필터와 독립적으로 동작하는 추천 영역입니다. */}
        {highlights.length > 0 && (
          <section className={styles.highlightSection} aria-label="최대 할인율 상품">
            <div className={styles.highlightHeader}>
              <h2 className={styles.highlightTitle}>🔥 최대 할인율 TOP</h2>
              <p className={styles.highlightSubtitle}>지금 가장 많이 할인된 상품이에요</p>
            </div>
            <div className={styles.highlightStrip}>
              {highlights.map((product) => (
                <div key={product.id} className={styles.highlightItem}>
                  <ProductCard
                    product={product}
                    {...product}
                    isFavorite={isFavorite(product.id)}
                    onFavoriteToggle={toggleFavorite}
                    isComparing={isComparing(product.id)}
                    onCompareToggle={toggleCompare}
                    compareDisabled={isCompareFull}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 메인 컨텐츠 */}
        <main className={styles.main} id="products">
          {/* 섹션 헤더 */}
          <div className={styles.sectionHeader} ref={sectionHeaderRef}>
            <h2 className={styles.sectionTitle}>오늘 챙겨야 할 옷장 업데이트</h2>
            <p className={styles.sectionSubtitle}>
              브랜드·성별·카테고리를 조합해서 지금 역할을 해줄 아이템만 남겨 보세요.
            </p>
          </div>

          {/* 필터 토글 버튼
              searchBarWrap은 nav 검색창으로 이동했으므로 제거되었습니다.
              모바일에서는 이 토글 버튼을 통해 필터 패널을 열고 닫습니다. */}
          <button
            className={styles.filterToggleButton}
            onClick={toggleFilters}
            aria-label={showFilters ? '필터 숨기기' : '필터 보기'}
            aria-expanded={showFilters}
          >
            <span className={styles.filterToggleIcon}>
              {showFilters ? '✕' : '⚙'}
            </span>
            <span className={styles.filterToggleText}>
              {showFilters ? '필터 닫기' : '필터'}
            </span>
          </button>

          {/* 모바일 오버레이 */}
          {showFilters && (
            <div
              className={styles.filterOverlay}
              onClick={toggleFilters}
              aria-hidden="true"
            />
          )}

          {/* 
            필터 패널 
            [수정됨] 이전에는 여기에 불필요한 중첩 div(filterPanel 클래스)가 하나 더 있어 
            모바일 스크롤이 갇히는 문제가 있었습니다. 해당 중첩을 제거하여 해결했습니다.
          */}
          <div
            className={`${styles.filterPanel} ${showFilters ? styles.filterPanelVisible : ''}`}
            ref={filterPanelRef}
          >
            <BrandFilter
              selectedBrand={selectedBrand}
              onBrandChange={handleBrandChange}
            />
            <DetailedFilters
              selectedDiscount={selectedDiscount}
              onDiscountChange={handleDiscountChange}
              selectedPrice={selectedPrice}
              onPriceChange={handlePriceChange}
            />
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>성별</div>
                <GenderFilter
                  selectedGender={selectedGender}
                  onGenderChange={handleGenderChange}
                />
              </div>
              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>카테고리</div>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            </div>
          </div>

          {/* 자연어 검색 해석 결과 칩 — "이렇게 이해했어요"를 사용자에게 피드백
              예: "유니클로", "5만원 이하", "30% 이상" */}
          {appliedSearchLabels.length > 0 && (
            <div className={styles.parsedChips} aria-label="검색 해석 결과">
              <span className={styles.parsedChipsLabel}>이렇게 찾았어요:</span>
              {appliedSearchLabels.map(label => (
                <span key={label} className={styles.parsedChip}>{label}</span>
              ))}
            </div>
          )}

          {/* 결과/정렬 툴바 — 좌: 현재 표시 개수, 우: 품절 제외 토글 + 정렬 드롭다운
              사용자가 "지금 몇 개가 보이는지", "어떤 순서로 볼지"를 한눈에 제어합니다. */}
          <div className={styles.resultsToolbar}>
            <span className={styles.resultsCount} aria-live="polite">
              {isInitialLoading
                ? '불러오는 중…'
                : `${filteredProducts.length.toLocaleString()}개 상품`}
            </span>

            <div className={styles.toolbarActions}>
              {/* 품절 제외 토글 — 켜지면 inStock === false 상품을 숨깁니다. */}
              <button
                type="button"
                className={`${styles.soldOutToggle} ${excludeSoldOut ? styles.soldOutToggleActive : ''}`}
                onClick={handleToggleSoldOut}
                aria-pressed={excludeSoldOut}
              >
                <span className={styles.soldOutToggleCheck} aria-hidden="true">
                  {excludeSoldOut ? '☑' : '☐'}
                </span>
                품절 제외
              </button>

              {/* 정렬 드롭다운 */}
              <SortDropdown value={sortValue} onChange={handleSortChange} />
            </div>
          </div>

          {/* 초기 로딩 — shimmer 스켈레톤 카드 8개
              스피너 대신 shimmer 애니메이션으로 콘텐츠 영역을 미리 채웁니다.
              Array.from으로 길이 8짜리 배열을 만들어 map으로 렌더링합니다. */}
          {isInitialLoading && (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '35%' }} />
                    <div className={styles.skeletonLine} style={{ width: '75%' }} />
                    <div className={styles.skeletonLine} style={{ width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {!isInitialLoading && hasBlockingError && products.length === 0 && (
            <div className={styles.errorState} role="status">
              <h3 className={styles.errorTitle}>데이터를 가져오는 데 실패했어요</h3>
              <p className={styles.errorDescription}>
                {error}
              </p>
            </div>
          )}

          {/* 상품 그리드 */}
          {!isInitialLoading && !hasBlockingError && (
            <>
              <div className={styles.productsGrid}>
                {shouldShowEmptyState
                  ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>{emptyIcon}</div>
                      <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
                      <p className={styles.emptyDescription}>{emptyDescription}</p>
                    </div>
                  )
                  : (
                    filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        {...product}
                        isFavorite={isFavorite(product.id)}
                        onFavoriteToggle={toggleFavorite}
                        isComparing={isComparing(product.id)}
                        onCompareToggle={toggleCompare}
                        compareDisabled={isCompareFull}
                        cardIndex={index}
                      />
                    ))
                  )}
              </div>

              {/* 추가 로딩 — shimmer 스켈레톤 카드 4개 (무한 스크롤 시 하단에 표시) */}
              {isFetchingMore && (
                <div className={styles.skeletonGrid}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                      <div className={styles.skeletonImage} />
                      <div className={styles.skeletonBody}>
                        <div className={styles.skeletonLine} style={{ width: '40%' }} />
                        <div className={styles.skeletonLine} style={{ width: '65%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isInitialLoading && hasBlockingError && products.length > 0 && (
                <div className={styles.errorState} role="status">
                  <h3 className={styles.errorTitle}>추가 데이터를 가져오지 못했습니다</h3>
                  <p className={styles.errorDescription}>
                    {error}
                  </p>
                </div>
              )}

              {/* 이 div는 화면에 보이지 않지만, 관찰 대상이 되어 다음 페이지를 로드합니다. */}
              <div
                ref={loadMoreRef}
                style={{ width: '100%', height: '200px' }}
                aria-hidden="true"
              />
            </>
          )}
        </main>


      </div >
      <div className={styles.rightAd}>
        {/* 광고 영역 */}
      </div>
      {
        showScrollTop && (
          <button
            type="button"
            className={styles.scrollTopButton}
            onClick={scrollToTop}
            aria-label="맨 위로 이동"
          >
            ↑
          </button>
        )
      }

      {/* 상품 비교 트레이 — 비교함에 담긴 상품이 있을 때만 하단에 고정 표시됩니다. */}
      <CompareTray
        items={compareItems}
        onRemove={removeCompare}
        onClear={clearCompare}
      />
    </div >
  )
}
