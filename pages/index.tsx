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
import { SORT_OPTIONS, DEFAULT_SORT_VALUE, BRAND_METADATA } from '../types'
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

  /**
   * activeBrandCount - "지금 세일 데이터를 수집 중인 브랜드 수"
   *
   * BRAND_METADATA에는 아직 수집 전인 브랜드(status: 'planned'/'noSale')도 함께 들어 있으므로,
   * 실제로 데이터가 있는 'active' 브랜드만 세어야 히어로의 숫자가 거짓말을 하지 않습니다.
   * 상수 기반이라 계산 비용은 0에 가깝지만, 렌더마다 배열을 새로 만들지 않도록 useMemo로 고정합니다.
   */
  const activeBrandCount = useMemo(
    () => Object.values(BRAND_METADATA).filter(meta => meta.status === 'active').length,
    [],
  )

  /**
   * topDiscountRate - 현재 아카이브에서 가장 큰 할인율
   *
   * highlights는 "할인율 높은순" 상위 상품이므로 첫 번째 항목의 할인율이 곧 최고 할인율입니다.
   * 별도 API 호출 없이 이미 받아온 데이터를 재사용합니다(네트워크 비용 0).
   * 아직 로딩 전이면 0이고, 이때 히어로에서는 해당 지표를 렌더하지 않습니다.
   */
  const topDiscountRate = highlights[0]?.discountRate ?? 0

  /**
   * leadProduct - 지면 상단(Lead)에 크게 싣는 "오늘의 1번 항목"
   *
   * 별도 API 없이 highlights(할인율 높은순 상위)의 첫 항목을 그대로 씁니다.
   * 장식용 이미지를 새로 만드는 대신, 실제 데이터 중 가장 강한 항목 하나를
   * 크게 싣는 편이 이 서비스의 성격(인하 기록)을 훨씬 정확히 보여줍니다.
   */
  const leadProduct = highlights[0]

  /**
   * datelineDate - 마스트헤드 아래 날짜줄에 찍는 "오늘" 날짜
   *
   * 신문의 dateline처럼 "이 지면이 언제 것인지"를 밝힙니다.
   * 서버와 클라이언트의 시각이 달라 hydration 경고가 나지 않도록
   * 마운트 이후에 채웁니다(초기 렌더에서는 빈 문자열).
   */
  const [datelineDate, setDatelineDate] = useState<string>('')
  useEffect(() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    setDatelineDate(`${yyyy}.${mm}.${dd}`)
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
        const normalized = normalizeProducts(response.products ?? [])

        // 백엔드에 같은 상품이 중복 문서로 존재하므로(id 중복 + 동일 상품 별도 문서),
        // 스트립에서도 id·시그니처 기준으로 대표 1장만 남깁니다.
        const seen = new Set<string>()
        const unique = normalized.filter((product) => {
          const keys = [product.id, `${product.brand}|${product.name}|${product.salePrice}`]
          if (keys.some(key => seen.has(key))) return false
          keys.forEach(key => seen.add(key))
          return true
        })

        setHighlights(unique)
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

  /**
   * mergeUniqueProducts - 상품 목록 병합 + 중복 제거
   *
   * 두 종류의 중복을 모두 걸러냅니다 (2026-07-19 백엔드 데이터 감사에서 발견):
   * 1) 같은 id가 두 번 내려오는 경우 — 백엔드에 완전히 동일한 문서가 중복 저장됨
   *    → React "duplicate key" 경고와 카드 2장 표시의 원인
   * 2) id는 다른데 같은 상품인 경우 — 같은 상품이 별도 문서로 여러 번 크롤링됨
   *    (예: "칼라 케이블 니트 탑"이 3장 연속 표시)
   *    → 브랜드+상품명+가격 시그니처로 대표 1장만 남깁니다
   *
   * replace=true(필터 변경)일 때도 배치 내부 중복은 제거해야 하므로
   * 기존처럼 incoming을 그대로 반환하지 않고 항상 dedupe를 거칩니다.
   */
  const mergeUniqueProducts = useCallback((prevProducts: NormalizedProduct[], incomingProducts: NormalizedProduct[], replace: boolean) => {
    // 시그니처: 브랜드|상품명|판매가 — 같은 상품의 중복 문서를 하나로 묶는 키
    const signatureOf = (product: NormalizedProduct) =>
      `${product.brand}|${product.name}|${product.salePrice}`

    const base = replace ? [] : prevProducts
    const seenIds = new Set(base.map(product => product.id))
    const seenSignatures = new Set(base.map(signatureOf))
    const merged = [...base]

    incomingProducts.forEach((product) => {
      const signature = signatureOf(product)
      if (product.id && !seenIds.has(product.id) && !seenSignatures.has(signature)) {
        seenIds.add(product.id)
        seenSignatures.add(signature)
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

  /**
   * ═══════════════════════════════════════════════════════════════
   * 활성 필터 요약 (#개편)
   * ═══════════════════════════════════════════════════════════════
   * 왜 필요한가요?
   * 상세 필터를 접어두는 구조로 바꾸면서 "지금 뭐가 걸려 있는지"가 보이지 않게 됐습니다.
   * 접힌 상태에서도 걸린 조건을 칩으로 보여주고, 한 번에 해제할 수 있어야
   * 사용자가 "결과가 왜 이것뿐이지?"라고 헤매지 않습니다.
   *
   * 각 항목은 { key, label, clear } 형태입니다.
   * - key   : React key 및 중복 방지용 식별자
   * - label : 칩에 표시할 한글 라벨
   * - clear : 그 조건만 개별 해제하는 함수
   */
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = []

    if (selectedBrand !== 'all') {
      list.push({
        key: 'brand',
        label: BRAND_METADATA[selectedBrand]?.name ?? selectedBrand,
        clear: () => setSelectedBrand('all'),
      })
    }
    if (selectedGender !== 'all') {
      const genderLabel = selectedGender === 'MAN' ? '남성' : selectedGender === 'WOMAN' ? '여성' : '공용'
      list.push({ key: 'gender', label: genderLabel, clear: () => setSelectedGender('all') })
    }
    if (selectedCategory !== 'all') {
      const categoryLabel: Record<string, string> = {
        TOP: '상의', BOTTOM: '하의', OUTER: '아우터', SHOES: '신발', ETC: '기타',
      }
      list.push({
        key: 'category',
        label: categoryLabel[selectedCategory] ?? selectedCategory,
        clear: () => setSelectedCategory('all'),
      })
    }
    if (selectedDiscount > 0) {
      list.push({
        key: 'discount',
        label: `${selectedDiscount}% 이상`,
        clear: () => setSelectedDiscount(0),
      })
    }
    if (Number.isFinite(selectedPrice)) {
      list.push({
        key: 'price',
        // 30000 → "3만원 이하"처럼 사람이 읽는 단위로 변환합니다.
        label: `${(selectedPrice / 10000).toLocaleString()}만원 이하`,
        clear: () => setSelectedPrice(Infinity),
      })
    }
    if (searchKeyword) {
      list.push({
        key: 'keyword',
        label: `"${searchKeyword}"`,
        clear: () => { setSearchKeyword(''); setSearchInput(''); setAppliedSearchLabels([]) },
      })
    }

    return list
  }, [selectedBrand, selectedGender, selectedCategory, selectedDiscount, selectedPrice, searchKeyword])

  /**
   * handleResetFilters - 모든 필터를 한 번에 초기 상태로 되돌립니다.
   * 정렬(sortValue)은 "필터"가 아니라 "보기 방식"이므로 일부러 건드리지 않습니다.
   */
  const handleResetFilters = () => {
    setSelectedBrand('all')
    setSelectedGender('all')
    setSelectedCategory('all')
    setSelectedDiscount(0)
    setSelectedPrice(Infinity)
    setSearchKeyword('')
    setSearchInput('')
    setAppliedSearchLabels([])
    setExcludeSoldOut(false)
  }

  /**
   * 상세 필터 패널을 Escape 키로 닫습니다.
   * 펼쳐진 영역을 키보드만으로 빠져나갈 수 있어야 접근성 기준을 만족합니다.
   */
  useEffect(() => {
    if (!showFilters) {
      return undefined
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showFilters])

  // 통계 계산
  const isNoResultsError = error === 'NO_RESULTS'
  const hasBlockingError = Boolean(error && !isNoResultsError)

  /**
   * 실패를 두 갈래로 구분합니다.
   * - initialLoadFailed : 목록이 비어 있는 상태에서의 실패 → 화면 전체를 에러로 대체
   * - loadMoreFailed    : 이미 목록이 있는 상태에서의 실패 → 목록은 유지하고 배너만 추가
   *
   * 이 구분이 없으면 무한 스크롤 실패 한 번에 화면 전체가 비어버립니다(위 그리드 주석 참고).
   */
  const initialLoadFailed = hasBlockingError && products.length === 0
  const loadMoreFailed = hasBlockingError && products.length > 0

  const shouldShowEmptyState = !isInitialLoading && filteredProducts.length === 0 && !hasBlockingError

  /**
   * 빈 상태 문구 — "왜 비었는지"에 따라 다르게 안내합니다.
   * 조건이 걸려 있으면 조건 탓이고, 아무 조건도 없는데 비었다면 데이터 자체가 없는 것이므로
   * 사용자에게 요구할 행동이 다릅니다.
   */
  const hasAnyFilter = activeFilters.length > 0 || excludeSoldOut
  const emptyTitle = hasAnyFilter
    ? '조건에 맞는 상품이 없어요'
    : '지금은 할인 중인 상품이 없어요'
  const emptyDescription = hasAnyFilter
    ? '조건을 하나씩 풀어보면 더 많은 상품을 볼 수 있습니다.'
    : '세일 정보는 매일 갱신됩니다. 잠시 후 다시 확인해 주세요.'

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

        {/* ═══════════════════════════════════════════════════════════
            마스트헤드
            ═══════════════════════════════════════════════════════════
            [Ledger 재설계]
            이전 헤더는 반투명 배경 + backdrop-filter blur(18px)의 이른바
            글래스모피즘이었습니다. 뒤로 상품 사진이 지나가면 헤더 글자의 대비가
            스크롤 위치마다 달라져 읽기가 불안정했고, blur는 저사양 기기에서
            스크롤 성능도 갉아먹습니다.
            지금은 신문 제호(masthead)처럼 불투명 지면 위에 얹고
            아래를 굵은 괘선으로 닫습니다. */}
        <header className={`${styles.masthead} ${navScrolled ? styles.mastheadScrolled : ''}`}>
          <div className={styles.mastheadInner}>

            {/* 제호 — "A"에서 "ARCA"가 펼쳐지는 리빌은 유지하되,
                아래에 발행 성격을 밝히는 부제를 붙여 색인의 제호처럼 읽히게 했습니다. */}
            <Link href="/" className={styles.logo}>
              <span className={styles.logoSegment}>
                <span className={styles.logoChar}>A</span>
                <span className={`${styles.logoWord} ${logoStep >= 1 ? styles.logoWordVisible : ''}`}>
                  RCA
                </span>
              </span>
              <span className={styles.logoTagline}>SPA Sale Archive</span>
            </Link>

            {/* 검색창
                [버그 수정] 이전에는 480px 이하에서 이 검색 폼이 CSS로 완전히 숨겨져 있었습니다.
                주석에는 "모바일은 필터 패널 내 검색 사용"이라고 적혀 있었지만
                필터 패널에는 검색 입력이 존재한 적이 없어서, 실제로는
                작은 화면 사용자가 검색 기능 자체에 접근할 수 없었습니다.
                이제 모바일에서는 nav 아래 줄로 내려오도록 바꿔 항상 사용 가능합니다.

                아이콘은 이모지(🔍) 대신 인라인 SVG로 교체했습니다.
                이모지는 OS/폰트마다 크기와 색이 제각각이고 컬러 이모지라
                모노크롬 톤을 깨뜨립니다. SVG는 currentColor를 따라갑니다. */}
            <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search">
              <svg
                className={styles.searchIcon}
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <line x1="10.8" y1="10.8" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                name="keyword"
                value={searchInput}
                onChange={handleSearchInputChange}
                className={styles.searchInput}
                placeholder="예) 유니클로 니트 5만원 이하"
                aria-label="상품 검색"
              />
              {/* 검색어가 있을 때만 지우기 버튼 표시 */}
              {searchInput && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => { setSearchInput(''); setSearchKeyword(''); setAppliedSearchLabels([]); }}
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </form>

            {/* 오른쪽 액션 — 찜 목록 + 테마 토글 */}
            <div className={styles.mastheadActions}>
              <Link href="/favorites" className={styles.iconLink} aria-label="찜 목록">
                <span aria-hidden="true">♥</span>
                {getFavoriteCount() > 0 && (
                  <span className={styles.iconLinkCount}>{getFavoriteCount()}</span>
                )}
              </Link>
              <ThemeToggle />
            </div>

          </div>

          {/* ── 날짜줄(dateline) ──
              신문 1면에서 제호 아래 가로로 놓이는 발행 정보 줄입니다.
              전부 실제 데이터이며, 이전 버전의 "지표 카드 3개"를 대체합니다.
              카드로 감싸지 않고 한 줄에 눕히면 화면 위쪽 무게가 확 줄어들어
              상품 목록이 훨씬 위로 올라옵니다. */}
          <dl className={styles.dateline}>
            <div className={styles.datelineItem}>
              <dt>발행</dt>
              <dd className={styles.datelineFigure}>{datelineDate || '—'}</dd>
            </div>
            <div className={styles.datelineItem}>
              <dt>수록</dt>
              <dd className={styles.datelineFigure}>
                {(Number.isFinite(animatedCount) ? animatedCount : 0).toLocaleString()}건
              </dd>
            </div>
            <div className={styles.datelineItem}>
              <dt>브랜드</dt>
              <dd className={styles.datelineFigure}>{activeBrandCount}</dd>
            </div>
            {topDiscountRate > 0 && (
              <div className={styles.datelineItem}>
                <dt>최대 인하</dt>
                <dd className={`${styles.datelineFigure} ${styles.datelineAccent}`}>
                  −{topDiscountRate}%
                </dd>
              </div>
            )}
          </dl>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            리드(Lead) — 1면 머리기사
            ═══════════════════════════════════════════════════════════
            좌 7 : 우 5의 비대칭 2단 구성입니다.
            좌측은 활자만으로 이루어진 사설 블록, 우측은 오늘 가장 크게 인하된
            "실제 상품 1건"을 크게 싣습니다.

            [왜 생성 이미지를 쓰지 않았나]
            여기에 AI로 만든 히어로 비주얼을 넣을 수도 있었지만, 이 서비스의
            1면에 실려야 할 그림은 "오늘 실제로 78% 내려간 옷"이지 분위기 사진이
            아닙니다. 실데이터 항목을 크게 싣는 편이 서비스의 성격을 정확히
            보여주고, 그 자체가 클릭 가능한 유효한 콘텐츠가 됩니다. */}
        <section className={styles.lead}>
          <div className={styles.leadText}>
            <h1 className={styles.leadTitle}>
              오늘 가장 많이<br />내려간 옷들
            </h1>

            <p className={styles.leadStanding}>
              H&amp;M · ZARA · UNIQLO · MUJI · 찰스앤키스의 인하 항목을 매일 모아
              한 자리에 기록합니다. 값이 내린 순서로 읽으세요.
            </p>

            {/* 오늘의 시선 — 매일 바뀌는 에디토리얼 한 줄.
                제목 아래 얇은 괘선으로 본문과 분리해 "주석"처럼 읽히게 했습니다. */}
            <p className={styles.leadNote}>
              <span className={styles.leadNoteLabel}>오늘의 시선</span>
              <strong>{dailyInsight.theme}</strong>
              <span>{dailyInsight.tip}</span>
              <span className={styles.leadNoteMood}>{dailyMood.palette} · {dailyMood.focus}</span>
            </p>
          </div>

          {/* 1번 항목 — highlights의 첫 항목(할인율 최고)을 그대로 씁니다.
              데이터가 도착하기 전에는 자리만 잡아두어 레이아웃이 튀지 않게 합니다. */}
          <div className={styles.leadFeature}>
            {leadProduct ? (
              <>
                <p className={styles.leadFeatureLabel}>
                  <span className={styles.leadFeatureRank}>01</span>
                  오늘의 최대 낙폭
                </p>
                <ProductCard
                  product={leadProduct}
                  {...leadProduct}
                  isFavorite={isFavorite(leadProduct.id)}
                  onFavoriteToggle={toggleFavorite}
                  isComparing={isComparing(leadProduct.id)}
                  onCompareToggle={toggleCompare}
                  compareDisabled={isCompareFull}
                />
              </>
            ) : (
              <div className={styles.leadFeaturePlaceholder} aria-hidden="true" />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            낙폭 상위 — 가로 밴드
            ═══════════════════════════════════════════════════════════
            리드에 실린 1번 항목 다음(02번부터)을 가로로 이어 붙입니다.
            메인 색인의 필터와 무관하게 항상 "오늘 가장 많이 내려간 순"입니다. */}
        {highlights.length > 1 && (
          <section className={styles.band} aria-label="낙폭 상위 항목">
            <div className={styles.bandHeader}>
              <h2 className={styles.bandTitle}>낙폭 상위</h2>
              <span className={styles.bandHint} aria-hidden="true">→ 옆으로</span>
            </div>
            <ul className={styles.bandStrip}>
              {highlights.slice(1).map((product, index) => (
                <li key={product.id} className={styles.bandItem}>
                  <ProductCard
                    product={product}
                    {...product}
                    /* 리드가 01번이므로 밴드는 02번부터 시작합니다. */
                    indexNumber={index + 2}
                    isFavorite={isFavorite(product.id)}
                    onFavoriteToggle={toggleFavorite}
                    isComparing={isComparing(product.id)}
                    onCompareToggle={toggleCompare}
                    compareDisabled={isCompareFull}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            색인(Index) — 전체 목록
            ═══════════════════════════════════════════════════════════ */}
        <main className={styles.index} id="products">
          <div className={styles.indexHeader} ref={sectionHeaderRef}>
            <h2 className={styles.indexTitle}>전체 색인</h2>
            <p className={styles.indexSubtitle}>
              브랜드와 조건을 좁혀 원하는 항목만 남기세요.
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              탐색 바 (browseBar)
              ═══════════════════════════════════════════════════════════
              [개편 의도]
              이전에는 브랜드·성별·카테고리·할인율·가격이 전부 하나의 큰 패널에
              펼쳐진 채로 놓여 있어, 데스크톱에서만 371px을 차지했습니다.
              그만큼 상품 그리드가 아래로 밀려났습니다.

              이 서비스에서 가장 자주 쓰는 축은 "브랜드"이므로 브랜드 칩만 항상 노출하고,
              나머지(성별/카테고리/할인율/가격)는 '상세 필터' 안으로 접었습니다.

              [모바일 바텀시트를 걷어낸 이유]
              이전 구조는 position: fixed + bottom: -100%로 화면 밖에 "숨겨둔" 패널이었습니다.
              CSS로 위치만 밀어낸 것이라 실제로는 DOM에 그대로 남아 있어,
              닫힌 상태에서도 Tab 키로 그 안의 버튼들에 포커스가 들어갔습니다
              (스크린리더 사용자에게는 보이지 않는 컨트롤이 계속 읽히는 상태).
              모바일/데스크톱 모두 같은 인라인 접기 구조로 통일해 이 문제를 없앴고,
              화면을 가리던 플로팅 필터 버튼(FAB)과 오버레이도 함께 제거했습니다. */}
          <div className={styles.browseBar}>
            <BrandFilter
              selectedBrand={selectedBrand}
              onBrandChange={handleBrandChange}
            />
          </div>

          {/* 결과/정렬 툴바 — 좌: 현재 표시 개수, 우: 상세 필터 토글 + 품절 제외 + 정렬 */}
          <div className={styles.resultsToolbar}>
            <p className={styles.resultsCount} aria-live="polite">
              {isInitialLoading
                ? '불러오는 중…'
                : <><strong>{filteredProducts.length.toLocaleString()}</strong>개 상품</>}
            </p>

            <div className={styles.toolbarActions}>
              {/* 상세 필터 토글
                  aria-expanded/aria-controls로 "이 버튼이 아래 영역을 여닫는다"는 관계를
                  스크린리더에 명시합니다. 활성 필터 수는 배지로 함께 보여줍니다. */}
              <button
                type="button"
                className={`${styles.toolbarButton} ${showFilters ? styles.toolbarButtonActive : ''}`}
                onClick={toggleFilters}
                aria-expanded={showFilters}
                aria-controls="detail-filters"
              >
                상세 필터
                {activeFilters.length > 0 && (
                  <span className={styles.toolbarCount}>{activeFilters.length}</span>
                )}
              </button>

              {/* 품절 제외 토글 — 켜지면 inStock === false 상품을 숨깁니다.
                  ☑/☐ 문자 대신 CSS로 그린 체크박스를 써서 폰트에 따라
                  글리프가 깨지거나 크기가 들쭉날쭉해지는 문제를 없앴습니다. */}
              <button
                type="button"
                className={`${styles.toolbarButton} ${excludeSoldOut ? styles.toolbarButtonActive : ''}`}
                onClick={handleToggleSoldOut}
                aria-pressed={excludeSoldOut}
              >
                <span className={styles.toolbarCheck} aria-hidden="true" />
                품절 제외
              </button>

              {/* 정렬 드롭다운 */}
              <SortDropdown value={sortValue} onChange={handleSortChange} />
            </div>
          </div>

          {/* 상세 필터 — 접이식 영역
              hidden 속성을 쓰면 닫혔을 때 DOM에서 접근성 트리와 탭 순서에서 완전히 빠집니다.
              (CSS로 화면 밖에 밀어내던 이전 방식과 결정적으로 다른 부분입니다) */}
          <div
            id="detail-filters"
            className={styles.detailFilters}
            ref={filterPanelRef}
            hidden={!showFilters}
          >
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

          {/* 활성 필터 요약 — 접힌 상태에서도 걸린 조건이 보이도록 합니다.
              각 칩을 눌러 개별 해제하고, 오른쪽 '전체 해제'로 한 번에 초기화합니다. */}
          {activeFilters.length > 0 && (
            <div className={styles.activeFilters}>
              <span className={styles.activeFiltersLabel}>적용된 조건</span>
              <ul className={styles.activeFiltersList}>
                {activeFilters.map(filter => (
                  <li key={filter.key}>
                    <button
                      type="button"
                      className={styles.activeFilterChip}
                      onClick={filter.clear}
                      aria-label={`${filter.label} 조건 해제`}
                    >
                      {filter.label}
                      <span className={styles.activeFilterChipRemove} aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleResetFilters}
              >
                전체 해제
              </button>
            </div>
          )}

          {/* 자연어 검색 해석 결과 칩 — "이렇게 이해했어요"를 사용자에게 피드백
              예: "유니클로", "5만원 이하", "30% 이상" */}
          {appliedSearchLabels.length > 0 && (
            <p className={styles.parsedChips}>
              <span className={styles.parsedChipsLabel}>이렇게 찾았어요</span>
              {appliedSearchLabels.map(label => (
                <span key={label} className={styles.parsedChip}>{label}</span>
              ))}
            </p>
          )}

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

          {/* ═══════════════════════════════════════════════════════════
              최초 로딩 실패 — 보여줄 상품이 하나도 없는 상태
              ═══════════════════════════════════════════════════════════
              role="alert"는 화면이 바뀌는 즉시 스크린리더가 읽어줍니다.
              (role="status"는 "여유 있을 때" 읽으므로 실패 알림에는 alert가 맞습니다) */}
          {!isInitialLoading && initialLoadFailed && (
            <div className={styles.errorState} role="alert">
              <h3 className={styles.errorTitle}>상품을 불러오지 못했어요</h3>
              <p className={styles.errorDescription}>{error}</p>
              <button
                type="button"
                className={styles.errorRetryButton}
                onClick={() => loadProducts({ pageToLoad: 0, replace: true })}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              상품 그리드
              ═══════════════════════════════════════════════════════════
              [버그 수정] 이전 조건은 `!isInitialLoading && !hasBlockingError` 였습니다.
              무한 스크롤로 다음 페이지를 불러오다 실패하면 error가 채워지면서
              hasBlockingError가 true가 되고, 그 순간 이 블록 전체가 사라져
              "이미 보고 있던 상품 수십 개가 통째로 화면에서 증발"했습니다.
              게다가 그때 표시되어야 할 에러 문구는 이 블록 *안에* 있어서
              함께 사라졌기 때문에, 사용자에게는 아무 설명 없이 빈 화면만 남았습니다.

              이제 실패를 두 종류로 나눠 처리합니다.
                - initialLoadFailed : 보여줄 게 없음 → 위쪽 에러 화면
                - loadMoreFailed    : 이미 본 목록은 그대로 두고 아래에 재시도 배너만 추가 */}
          {!isInitialLoading && !initialLoadFailed && (
            <>
              <div className={styles.productsGrid}>
                {shouldShowEmptyState
                  ? (
                    /* 빈 상태 — 이모지(😔/🔍)를 걷어내고 "다음에 뭘 해야 하는지"를
                       버튼으로 제시합니다. 조건이 걸려 있을 때만 해제 버튼을 띄웁니다. */
                    <div className={styles.emptyState}>
                      <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
                      <p className={styles.emptyDescription}>{emptyDescription}</p>
                      {activeFilters.length > 0 && (
                        <button
                          type="button"
                          className={styles.emptyActionButton}
                          onClick={handleResetFilters}
                        >
                          필터 전체 해제
                        </button>
                      )}
                    </div>
                  )
                  : (
                    filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        {...product}
                        /* 색인 번호는 1부터. 무한 스크롤로 항목이 늘어나도
                           목록 내 순번이 이어지므로 "어디까지 봤는지" 감이 잡힙니다. */
                        indexNumber={index + 1}
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
                <div className={styles.skeletonGrid} aria-hidden="true">
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

              {/* 추가 로딩 실패 — 지금까지 본 목록은 유지한 채 재시도만 제안합니다. */}
              {loadMoreFailed && (
                <div className={styles.loadMoreError} role="alert">
                  <p className={styles.loadMoreErrorText}>{error}</p>
                  <button
                    type="button"
                    className={styles.errorRetryButton}
                    onClick={() => {
                      setError(null)
                      setHasMore(true)
                      loadProducts({ pageToLoad: page + 1, replace: false })
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {/* 마지막 페이지까지 다 본 경우 — 무한 스크롤이 왜 멈췄는지 알려줍니다. */}
              {!hasMore && !loadMoreFailed && filteredProducts.length > 0 && (
                <p className={styles.listEnd}>마지막 상품까지 모두 확인했습니다</p>
              )}

              {/* 이 div는 화면에 보이지 않지만, 관찰 대상이 되어 다음 페이지를 로드합니다. */}
              <div
                ref={loadMoreRef}
                className={styles.loadMoreSentinel}
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
