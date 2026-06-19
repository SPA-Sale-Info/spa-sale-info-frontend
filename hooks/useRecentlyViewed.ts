/**
 * hooks/useRecentlyViewed.ts - 최근 본 상품 관리 커스텀 훅 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 사용자가 최근에 본 상품 목록을 관리합니다.
 * 상품 상세 페이지를 방문하면 그 상품이 "최근 본 상품" 목록에 자동으로 추가됩니다.
 * 데이터는 localStorage에 저장하여 페이지를 새로고침해도 유지됩니다.
 * 최대 10개만 저장하고, 같은 상품은 중복 저장하지 않습니다(가장 최근 것만 유지).
 *
 * ═══════════════════════════════════════════════════════════════
 * 커스텀 훅(Custom Hook)이란?
 * ═══════════════════════════════════════════════════════════════
 * 여러 컴포넌트에서 재사용할 수 있는 상태 로직을 하나의 함수로 분리한 것입니다.
 * React 훅(useState, useEffect 등)을 내부적으로 사용하는 함수입니다.
 * 반드시 이름이 'use'로 시작해야 React가 훅으로 인식합니다.
 *
 * 이 훅 없이 구현한다면:
 * - 각 컴포넌트마다 localStorage 읽기/쓰기 코드를 반복해야 합니다.
 * - 이 훅이 있으면 useRecentlyViewed() 한 줄로 모든 기능을 사용할 수 있습니다.
 *
 * Java 비유:
 * Spring의 @Service 클래스처럼 비즈니스 로직을 분리하여
 * 여러 @Controller에서 재사용할 수 있게 만든 것과 유사합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * localStorage란?
 * ═══════════════════════════════════════════════════════════════
 * 브라우저에 내장된 키-값 저장소입니다.
 * - 탭을 닫아도, 브라우저를 재시작해도 데이터가 유지됩니다 (영구 저장).
 * - 같은 도메인(사이트)에서만 접근할 수 있습니다.
 * - 문자열(String)만 저장할 수 있어서 객체는 JSON으로 변환합니다.
 * - Java의 Redis (캐시 저장소)와 유사하지만, 클라이언트(브라우저) 측에 있습니다.
 *
 * sessionStorage와의 차이:
 * - localStorage: 탭을 닫아도 데이터 유지 (영구)
 * - sessionStorage: 탭을 닫으면 데이터 삭제 (임시)
 * → 최근 본 상품은 다음 방문 시에도 보여줘야 하므로 localStorage를 사용합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - interface: 객체 구조 정의
 * - useState<RecentlyViewedItem[]>: 제네릭으로 배열 타입 지정
 * - useCallback: 함수 메모이제이션 (의존성이 바뀌지 않으면 함수 재생성 안 함)
 * - (product: Product) => void: 함수 타입 — Product를 받고 반환값 없음
 * - Array.isArray(): 값이 배열인지 검사
 * - ...item: 스프레드 연산자 — 객체의 모든 필드를 복사
 * - Array.filter(), Array.slice(): 배열 변환 메서드
 */

// useState: 상태값(recentItems, isInitialized) 관리
// useEffect: 컴포넌트 마운트 시 localStorage에서 데이터를 읽어옵니다
// useCallback: 함수를 메모이제이션하여 불필요한 재생성을 막습니다
import { useState, useEffect, useCallback } from 'react';

// import type: 타입 정보만 가져옵니다 (빌드된 JS에 포함 안 됨)
// Product는 types/index.ts에서 정의된 상품 데이터 타입입니다
import type { Product } from '../types';

/**
 * RECENTLY_VIEWED_KEY - localStorage에 저장할 때 사용하는 키(key) 이름
 *
 * localStorage는 키-값 쌍으로 저장합니다:
 * { 'spa_sale_recently_viewed': '[{"id":"1","name":"..."}]' }
 *
 * 키 이름에 'spa_sale_' 접두사를 붙이는 이유:
 * 다른 사이트나 라이브러리가 같은 키를 쓸 때 충돌을 방지합니다.
 * Java의 패키지 이름 규칙(com.company.project)과 비슷한 발상입니다.
 */
const RECENTLY_VIEWED_KEY = 'spa_sale_recently_viewed';

/**
 * MAX_RECENT_ITEMS - 최근 본 상품의 최대 저장 개수
 *
 * 10개를 초과하면 가장 오래된 항목이 제거됩니다.
 * Array.slice(0, MAX_RECENT_ITEMS)로 앞에서 10개만 잘라냅니다.
 * 이 값을 상수(const)로 분리하면 나중에 숫자를 바꿀 때 한 곳만 수정하면 됩니다.
 */
const MAX_RECENT_ITEMS = 10;

/**
 * RecentlyViewedItem - localStorage에 저장할 상품 데이터 구조
 *
 * Product 타입의 모든 필드를 저장하지 않고, 최근 본 상품 UI에 필요한 최소 정보만 저장합니다.
 * → localStorage 용량을 절약합니다.
 *
 * id: 상품 고유 식별자 (string으로 통일 — API에서 숫자로 올 수 있어서 변환)
 * name: 상품명
 * brand: 브랜드 코드 (예: 'HM', 'ZARA')
 * salePrice: 할인가 (필수)
 * originalPrice?: 원가 (선택 — 없을 수 있음)
 * discountRate?: 할인율 (선택 — 없을 수 있음)
 * imageUrl: 상품 이미지 URL
 * viewedAt: 조회한 시각 (ISO 8601 문자열, 예: '2024-01-15T14:30:00.000Z')
 *   → new Date().toISOString()으로 생성합니다.
 *   → Java의 LocalDateTime.now().toString()과 유사합니다.
 *
 * ?: optional 필드 — undefined 값을 허용합니다.
 *   TypeScript에서는 없는 필드와 undefined는 구분되지만, 실용적으로는 동일하게 처리합니다.
 */
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

/**
 * UseRecentlyViewedReturn - 이 훅이 반환하는 값과 함수의 구조
 *
 * 훅을 사용하는 컴포넌트는 이 인터페이스의 값들을 구조 분해 할당으로 받습니다:
 * const { recentItems, addRecentItem, isInitialized } = useRecentlyViewed();
 *
 * recentItems: 현재 최근 본 상품 목록 (배열)
 * addRecentItem: 상품을 최근 본 목록에 추가하는 함수
 * isInitialized: localStorage에서 초기 데이터 로드가 완료됐는지 여부
 *   → false인 동안에는 UI에서 로딩 상태를 표시할 수 있습니다.
 *   → SSR(서버 사이드 렌더링)에서는 localStorage에 접근할 수 없기 때문에,
 *      클라이언트에서 마운트된 후 로드 완료를 알리는 플래그로 사용됩니다.
 */
interface UseRecentlyViewedReturn {
  recentItems: RecentlyViewedItem[];
  addRecentItem: (product: Product) => void;
  isInitialized: boolean;
}

/**
 * useRecentlyViewed - 최근 본 상품 관리 커스텀 훅
 *
 * 반환 타입: UseRecentlyViewedReturn
 * → 인터페이스로 반환값의 구조를 명확하게 정의합니다.
 * → 사용하는 쪽에서 타입 자동완성과 타입 검사가 됩니다.
 *
 * 사용 예시:
 * function ProductDetail({ product }) {
 *   const { addRecentItem } = useRecentlyViewed();
 *
 *   useEffect(() => {
 *     addRecentItem(product); // 상품 상세 페이지 진입 시 최근 본 목록에 추가
 *   }, [product]);
 * }
 */
export default function useRecentlyViewed(): UseRecentlyViewedReturn {
  /**
   * recentItems 상태 — 최근 본 상품 목록
   *
   * useState<RecentlyViewedItem[]>([]):
   * - <RecentlyViewedItem[]>: 이 상태의 타입이 "RecentlyViewedItem의 배열"임을 TypeScript에게 알립니다.
   * - []: 초기값은 빈 배열입니다.
   *
   * 왜 초기값이 []인가요?
   * localStorage는 브라우저(클라이언트)에서만 접근 가능합니다.
   * Next.js는 서버에서 먼저 HTML을 생성(SSR)하는데, 이 시점에는 localStorage가 없습니다.
   * 먼저 빈 배열로 시작하고, 클라이언트에서 마운트된 후 useEffect에서 localStorage를 읽습니다.
   */
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  /**
   * isInitialized 상태 — localStorage에서 데이터 로드 완료 여부
   *
   * false: 아직 localStorage를 읽지 않은 상태 (서버 렌더링 중 또는 초기 상태)
   * true: localStorage 읽기가 완료된 상태 (recentItems가 실제 데이터를 반영)
   *
   * 이 플래그가 없으면 UI에서 "로딩 중" 상태를 알 수 없어서
   * 빈 목록과 "실제 비어있는 목록"을 구분하기 어렵습니다.
   */
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * useEffect — 컴포넌트 마운트 시 localStorage에서 최근 본 상품을 읽어옵니다.
   *
   * 의존성 배열: []  (빈 배열)
   * → 컴포넌트가 처음 마운트될 때 딱 한 번만 실행됩니다.
   * → Java의 @PostConstruct 메서드와 유사합니다 (생성 후 초기화).
   *
   * 왜 useEffect 안에서 localStorage를 읽나요?
   * Next.js는 서버에서 HTML을 먼저 생성합니다 (SSR).
   * 서버에는 localStorage가 없으므로, 서버에서 실행되면 에러가 납니다.
   * useEffect는 항상 클라이언트(브라우저)에서만 실행되므로 안전합니다.
   */
  useEffect(() => {
    try {
      /**
       * localStorage.getItem(키): 해당 키에 저장된 문자열을 읽어옵니다.
       * 없으면 null을 반환합니다.
       *
       * 예: localStorage.getItem('spa_sale_recently_viewed')
       * → '[{"id":"123","name":"면 티셔츠",...}]' (JSON 문자열)
       */
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        /**
         * JSON.parse(stored): JSON 문자열을 JavaScript 객체(배열)로 변환합니다.
         * localStorage는 문자열만 저장하므로, 저장 시 JSON.stringify(), 읽을 때 JSON.parse()를 씁니다.
         * Java 비유: new ObjectMapper().readValue(stored, List.class)
         *
         * 예:
         * stored = '[{"id":"1","name":"티셔츠"}]'  (문자열)
         * JSON.parse(stored) = [{ id: "1", name: "티셔츠" }]  (배열 객체)
         */
        const parsed = JSON.parse(stored);

        /**
         * Array.isArray(parsed): parsed가 실제 배열인지 검사합니다.
         * localStorage 데이터가 손상됐거나 다른 형식일 수 있으므로 방어적으로 확인합니다.
         * Java 비유: parsed instanceof List
         */
        if (Array.isArray(parsed)) {
          /**
           * 데이터 정규화(Normalization): 저장된 데이터의 유효성을 검사하고 타입을 통일합니다.
           *
           * .filter((item) => item && item.id !== undefined && item.id !== null):
           *   id가 없거나 null인 항목을 제거합니다 (유효하지 않은 데이터 제거).
           *   item &&: item 자체가 falsy(null, undefined, 0, '')인 경우도 제거합니다.
           *
           * .map((item) => ({ ...item, id: String(item.id) })):
           *   id를 항상 문자열로 변환합니다.
           *   API가 숫자로 id를 보낼 수도 있으므로 String()으로 통일합니다.
           *   { ...item }: 스프레드 연산자 — item의 모든 필드를 새 객체에 복사합니다.
           *   Java의 new Item(item) (복사 생성자)와 유사한 발상입니다.
           */
          const normalized = parsed
            .filter((item) => item && item.id !== undefined && item.id !== null)
            .map((item) => ({
              ...item,
              id: String(item.id),
            }));
          setRecentItems(normalized);
        }
      }
    } catch {
      /**
       * try-catch: JSON 파싱 오류, localStorage 접근 실패 등 예외를 조용히 무시합니다.
       * 최근 본 상품 복원 실패는 치명적 오류가 아니므로 에러를 사용자에게 노출하지 않습니다.
       * Java 비유: catch (Exception e) { /* 무시 *\/ }
       */
    } finally {
      /**
       * finally: try-catch 결과와 관계없이 항상 실행됩니다.
       * 성공이든 실패든 isInitialized를 true로 설정하여 초기화 완료를 알립니다.
       * Java 비유: finally { isInitialized = true; }
       */
      setIsInitialized(true);
    }
  }, []); // 빈 의존성 배열 — 컴포넌트 마운트 시 딱 한 번만 실행

  /**
   * addRecentItem - 상품을 최근 본 목록에 추가하는 함수
   *
   * useCallback으로 함수를 메모이제이션합니다:
   * - 의존성 배열이 [] (빈 배열)이므로 이 함수는 컴포넌트 생애 동안 한 번만 생성됩니다.
   * - 이 함수를 다른 컴포넌트에 props로 전달할 때, 매 렌더마다 새 함수가 생성되면
   *   자식 컴포넌트가 불필요하게 리렌더됩니다.
   * - useCallback으로 감싸면 같은 함수 참조를 유지하여 불필요한 리렌더를 방지합니다.
   *
   * (product: Product) => void:
   * - Product 타입의 인자 하나를 받습니다.
   * - 반환값이 없습니다 (void).
   * - Java 비유: Consumer<Product> addRecentItem
   */
  const addRecentItem = useCallback((product: Product) => {
    /**
     * 방어 코드: 유효하지 않은 상품 데이터는 처리하지 않습니다.
     * !product: product가 null이나 undefined인 경우
     * product.id === undefined || product.id === null: id가 없는 경우
     * early return 패턴 — 조건이 맞지 않으면 즉시 함수를 종료합니다.
     */
    if (!product || product.id === undefined || product.id === null) return;

    /**
     * String(product.id): id를 문자열로 변환합니다.
     * API에서 id가 숫자(number)로 올 수 있으므로 문자열로 통일합니다.
     * 이렇게 하면 '123' === '123' 비교가 가능합니다 (숫자 123 !== 문자열 '123').
     */
    const productId = String(product.id);

    /**
     * setRecentItems(함수형 업데이트):
     * 이전 상태(prev)를 인자로 받아 새 상태를 반환하는 함수를 전달합니다.
     *
     * 왜 setRecentItems(newArray) 대신 setRecentItems(prev => ...)를 쓰나요?
     * setRecentItems를 여러 번 빠르게 호출할 때 최신 상태를 보장하기 위해서입니다.
     * 클로저 문제를 방지합니다 (useCallback 내부에서 stale state를 참조할 수 있음).
     * Java 비유: 동기화된 상태 업데이트 (CAS - Compare and Swap)와 유사한 발상입니다.
     */
    setRecentItems((prev) => {
      /**
       * 중복 제거: 이미 본 상품이 있으면 목록에서 제거합니다.
       * → 같은 상품을 다시 보면 기존 항목을 삭제하고, 새 항목을 맨 앞에 추가합니다.
       * → 결과: 가장 최근에 본 순서로 정렬됩니다.
       *
       * .filter((item) => item.id !== productId):
       * - prev 배열에서 id가 productId와 다른 항목만 남깁니다.
       * - 즉, 방금 본 상품과 같은 id를 가진 기존 항목을 제거합니다.
       * - Array.filter()는 새 배열을 반환합니다 (원본 배열 불변).
       *   React 상태는 직접 수정하면 안 되므로 항상 새 배열을 만듭니다.
       * Java 비유: prev.stream().filter(item -> !item.getId().equals(productId)).collect(toList())
       */
      const filtered = prev.filter((item) => item.id !== productId);

      /**
       * 새 항목 생성: 현재 시각과 함께 최소 필요 정보를 구성합니다.
       *
       * newItem: RecentlyViewedItem:
       * - 타입 어노테이션으로 이 객체가 RecentlyViewedItem 구조여야 함을 명시합니다.
       * - TypeScript가 필드 누락이나 타입 오류를 컴파일 시점에 잡아줍니다.
       *
       * new Date().toISOString():
       * - 현재 시각을 ISO 8601 형식 문자열로 반환합니다.
       * - 예: '2024-01-15T14:30:00.000Z' (UTC 기준)
       * - Java의 LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)과 유사합니다.
       */
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

      /**
       * 새 목록 생성: 새 항목을 맨 앞에 추가하고, 최대 개수를 초과하면 잘라냅니다.
       *
       * [newItem, ...filtered]:
       * - 스프레드 연산자로 새 항목을 맨 앞에 추가합니다.
       * - newItem이 첫 번째, 기존 항목들이 그 뒤에 옵니다.
       * - 새 배열을 생성합니다 (기존 배열 불변 — React 상태 원칙).
       * Java 비유: List<RecentlyViewedItem> list = new ArrayList<>();
       *            list.add(0, newItem); list.addAll(filtered);
       *
       * .slice(0, MAX_RECENT_ITEMS):
       * - 배열의 0번 인덱스부터 MAX_RECENT_ITEMS(10)개만 남깁니다.
       * - 10개를 초과하면 가장 오래된 항목(맨 끝)이 잘립니다.
       * - Array.slice()는 원본을 수정하지 않고 새 배열을 반환합니다.
       */
      const newItems = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);

      /**
       * localStorage에 저장합니다.
       *
       * JSON.stringify(newItems):
       * - 배열 객체를 JSON 문자열로 변환합니다.
       * - localStorage는 문자열만 저장할 수 있으므로 직렬화가 필요합니다.
       * - 예: [{ id: '1', name: '티셔츠' }] → '[{"id":"1","name":"티셔츠"}]'
       * Java 비유: objectMapper.writeValueAsString(newItems)
       *
       * try-catch: localStorage 저장 실패 (용량 초과 등)를 무시합니다.
       * 저장 실패는 치명적 오류가 아닙니다 — 메모리 내 상태(recentItems)는 정상입니다.
       */
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
      } catch {
        // localStorage 저장 실패 시 무시 (용량 초과, 시크릿 모드 제한 등)
      }

      // 새 배열을 반환하면 React가 recentItems 상태를 업데이트합니다.
      return newItems;
    });
  }, []); // 빈 의존성 배열 — 이 함수는 한 번만 생성됩니다

  /**
   * 훅의 반환값 — 사용하는 컴포넌트에 제공하는 값과 함수
   *
   * 사용 예:
   * const { recentItems, addRecentItem, isInitialized } = useRecentlyViewed();
   *
   * 구조 분해 할당으로 필요한 값만 꺼내 쓸 수 있습니다.
   * Java 비유: RecentlyViewedService.getData() 결과를 DTO로 반환하는 것과 유사합니다.
   */
  return {
    recentItems,       // 최근 본 상품 목록 (배열)
    addRecentItem,     // 상품 추가 함수
    isInitialized,     // 초기화 완료 여부 (로딩 상태 표시에 사용)
  };
}
