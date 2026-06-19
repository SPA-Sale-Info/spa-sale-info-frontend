/**
 * hooks/useFavorites.ts - 찜/북마크 기능을 관리하는 커스텀 훅 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 사용자가 "♥ 찜하기" 버튼을 클릭했을 때 상품을 저장하고 관리합니다.
 * 찜 목록은 브라우저의 localStorage에 저장되어 새로고침 후에도 유지됩니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 커스텀 훅(Custom Hook)이란?
 * ═══════════════════════════════════════════════════════════════
 * - useState, useEffect 같은 React 내장 훅들을 조합하여 만든 재사용 가능한 로직입니다.
 * - 이름이 반드시 "use"로 시작해야 합니다 (React의 규칙).
 * - 여러 컴포넌트에서 같은 로직을 공유할 때 사용합니다.
 *
 * Java/Spring 비유:
 * - @Service 어노테이션이 붙은 Service 클래스와 유사합니다.
 * - 비즈니스 로직을 UI 컴포넌트에서 분리하는 역할을 합니다.
 * - 예: @Service public class FavoriteService { ... }
 *
 * ═══════════════════════════════════════════════════════════════
 * localStorage란?
 * ═══════════════════════════════════════════════════════════════
 * - 브라우저에 데이터를 영구적으로 저장하는 키-값 저장소입니다.
 * - 탭을 닫아도, 브라우저를 재시작해도 데이터가 유지됩니다.
 * - 사용자가 직접 삭제하거나 코드로 지우기 전까지 남아있습니다.
 * - Java/Spring 비유: 서버의 Redis(세션) 대신 클라이언트의 간단한 영속 저장소
 *
 * TypeScript 문법 포인트:
 * - interface: 객체 구조 정의
 * - useState<타입>: 상태의 타입을 명시
 * - useCallback: 함수를 메모이제이션하여 불필요한 재생성 방지
 * - string | number: 유니온 타입 (string 또는 number 중 하나)
 */

// useState: 변하는 값(상태)을 관리
// useEffect: 컴포넌트 마운트/업데이트 시 실행할 코드 등록
// useCallback: 함수를 의존성이 변경될 때만 재생성 (성능 최적화)
import { useState, useEffect, useCallback } from 'react';

// import type: 타입 정보만 가져옵니다 (빌드된 JS에 포함 안 됨)
import type { ApiProduct, Product, StoredFavoriteProduct } from '../types';
import { normalizeProduct } from '../utils/productNormalization';

/**
 * localStorage 키 상수
 *
 * 문자열 상수로 키를 관리하면:
 * 1. 오타를 방지할 수 있습니다.
 * 2. 키 이름을 바꿀 때 한 곳만 수정하면 됩니다.
 *
 * 다른 앱과 충돌을 피하기 위해 프로젝트명을 접두사로 붙입니다.
 * Java 비유: private static final String FAVORITES_KEY = "mat_project_favorites";
 */
const FAVORITES_STORAGE_KEY = 'mat_project_favorites';

/**
 * FavoriteItem - 찜 목록에 저장하는 상품 정보 구조
 *
 * Product 타입의 모든 필드를 저장하는 대신, 찜 목록에 필요한 최소한의 정보만 저장합니다.
 * 이렇게 하면 localStorage 용량을 절약하고, 데이터 구조가 단순해집니다.
 *
 * interface: 객체의 형태(필드와 타입)를 정의합니다.
 * ?: optional 필드 — 있어도 되고 없어도 됩니다.
 * Java 비유: @Getter @Setter DTO 클래스 (Lombok 사용)
 */
type FavoriteItem = StoredFavoriteProduct;

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

/**
 * UseFavoritesReturn - useFavorites 훅이 반환하는 값들의 타입
 *
 * 이 훅을 사용하는 컴포넌트는 이 타입에 정의된 값과 함수들을 받습니다.
 * 반환 타입을 명시하면 실수로 잘못된 값을 반환하는 것을 TypeScript가 방지합니다.
 *
 * Java 비유:
 * public interface FavoriteService {
 *   List<FavoriteItem> getFavorites();
 *   void toggleFavorite(Product product);
 *   boolean isFavorite(String productId);
 *   int getFavoriteCount();
 *   ...
 * }
 */
interface UseFavoritesReturn {
  favorites: FavoriteItem[];  // 찜한 상품 목록 (배열)
  // (Product | FavoriteItem): Product 또는 FavoriteItem 둘 다 받을 수 있습니다 (유니온 타입)
  toggleFavorite: (product: Product | FavoriteItem) => void; // 찜 추가/제거
  // string | number: 문자열이나 숫자 ID 둘 다 받습니다
  isFavorite: (productId: string | number) => boolean; // 찜 여부 확인
  getFavoriteCount: () => number; // 찜한 상품 수 반환
  // checkPriceDrops 반환 타입: hasDrop이 true이면 product와 message가 있고, false면 없습니다.
  checkPriceDrops: () => { hasDrop: boolean; product?: FavoriteItem; message?: string };
  isInitialized: boolean; // 초기화 완료 여부 (localStorage 로드 완료)
}

/**
 * useFavorites - 찜 기능 관리 커스텀 훅
 *
 * 사용 예시:
 * const { favorites, toggleFavorite, isFavorite, getFavoriteCount } = useFavorites();
 *
 * 반환 타입(UseFavoritesReturn)을 명시하여 어떤 구조가 반환되는지 명확히 합니다.
 * → 사용하는 곳에서 자동완성이 되고, 잘못된 필드 접근을 방지합니다.
 */
export default function useFavorites(): UseFavoritesReturn {
  /**
   * favorites 상태 — 찜한 상품 목록
   *
   * useState<FavoriteItem[]>([]):
   * - <FavoriteItem[]>: 이 상태는 FavoriteItem 배열임을 TypeScript에 알립니다.
   * - 초기값: 빈 배열([])
   * - setFavorites를 호출하면 favorites 값이 바뀌고 컴포넌트가 다시 렌더됩니다.
   *
   * Java 비유: private List<FavoriteItem> favorites = new ArrayList<>();
   */
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  /**
   * isInitialized 상태 — localStorage 초기화 완료 여부
   *
   * false로 시작하고, localStorage 읽기가 완료되면 true로 바뀝니다.
   * 이 값이 false일 때는 찜 목록을 아직 신뢰할 수 없으므로 UI를 숨길 수 있습니다.
   */
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 초기 로드 Effect — 컴포넌트 마운트 시 localStorage에서 찜 목록을 불러옵니다.
   *
   * useEffect(() => { ... }, []):
   * - 의존성 배열이 []이면 컴포넌트가 처음 화면에 나타날 때 딱 한 번만 실행됩니다.
   * - 클라이언트에서만 실행됩니다 (localStorage는 브라우저에만 있음).
   *
   * try-catch-finally 패턴:
   * - try: localStorage 읽기 시도
   * - catch: 파싱 오류 등이 발생하면 빈 배열로 초기화
   * - finally: 성공/실패 상관없이 항상 isInitialized = true로 설정
   *
   * Java 비유:
   * @PostConstruct
   * void loadFavorites() {
   *   try {
   *     String json = localStorage.get(FAVORITES_KEY);
   *     this.favorites = objectMapper.readValue(json, ...);
   *   } catch (Exception e) {
   *     this.favorites = new ArrayList<>();
   *   } finally {
   *     this.isInitialized = true;
   *   }
   * }
   */
  useEffect(() => {
    try {
      // localStorage.getItem(key): 키에 해당하는 값을 문자열로 반환합니다.
      // 값이 없으면 null을 반환합니다.
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        // JSON.parse(): JSON 문자열을 JavaScript 객체/배열로 변환합니다.
        // '[{"id":"1","name":"..."}]' → [{id:"1", name:"..."}]
        // Java의 ObjectMapper.readValue() 또는 Gson.fromJson()과 유사합니다.
        const parsed = JSON.parse(stored);

        // Array.isArray(): 파싱된 값이 배열인지 확인합니다.
        // localStorage에 잘못된 데이터가 있을 경우를 대비합니다.
        if (Array.isArray(parsed)) {
          /**
           * 데이터 정규화(Normalization):
           * - .filter(): null, undefined, id 없는 항목 제거
           * - .map(): id를 항상 string으로 통일
           *
           * 왜 id를 String으로 변환하나요?
           * 이전에 저장한 데이터의 id가 숫자일 수도 있습니다.
           * 비교 시 항상 String끼리 비교하도록 통일합니다.
           *
           * 스프레드 연산자 {...item}:
           * - item 객체의 모든 필드를 복사하고, id만 String으로 덮어씁니다.
           * - Java의 BeanUtils.copyProperties() + 특정 필드 수정과 유사합니다.
           */
          const normalized = parsed
            .filter((item): item is ApiProduct & { addedAt?: unknown } => {
              return Boolean(item && typeof item === 'object' && item.id !== undefined && item.id !== null);
            })
            .map((item) => {
              const normalizedProduct = normalizeProduct(item);
              return {
                ...normalizedProduct,
                addedAt: typeof item.addedAt === 'string' ? item.addedAt : new Date().toISOString(),
              };
            });
          setFavorites(normalized);
        }
      }
    } catch {
      // JSON 파싱 실패 등의 예외 발생 시 빈 배열로 초기화
      setFavorites([]);
    } finally {
      // 성공/실패에 관계없이 초기화 완료를 표시
      setIsInitialized(true);
    }
  }, []); // 빈 배열: 마운트 시 딱 한 번만 실행

  /**
   * localStorage 저장 Effect — favorites가 변경될 때마다 저장합니다.
   *
   * 의존성 배열: [favorites, isInitialized]
   * → favorites 또는 isInitialized가 변경될 때 이 Effect가 실행됩니다.
   *
   * isInitialized 체크:
   * - 초기 로드가 완료되지 않은 상태(isInitialized = false)에서는
   *   localStorage를 덮어쓰지 않습니다.
   * - 초기화 전에 빈 배열이 저장되면 기존 찜 목록이 지워집니다!
   *
   * JSON.stringify(): JavaScript 객체/배열을 JSON 문자열로 변환합니다.
   * [{id:"1", name:"..."}] → '[{"id":"1","name":"..."}]'
   * Java의 ObjectMapper.writeValueAsString() 또는 Gson.toJson()과 유사합니다.
   */
  useEffect(() => {
    if (!isInitialized) {
      // 아직 초기화 전이면 저장하지 않음
      return;
    }

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage 저장 실패 (용량 초과 등) — 무시하고 계속 진행
    }
  }, [favorites, isInitialized]); // favorites 또는 isInitialized가 바뀔 때 실행

  /**
   * toggleFavorite - 찜 추가/제거 토글 함수
   *
   * useCallback(() => { ... }, [의존성배열]):
   * - 의존성이 바뀔 때만 함수를 새로 생성합니다.
   * - 의존성이 같으면 이전에 만든 함수 참조를 재사용합니다.
   * - 왜 필요하나요? 함수가 매 렌더마다 새로 생성되면
   *   useEffect의 의존성 배열에 함수를 넣었을 때 무한 루프가 발생할 수 있습니다.
   *   useCallback으로 함수 동일성을 보장하여 이를 방지합니다.
   * Java 비유: @Cacheable (메서드 결과를 캐시, 입력이 같으면 캐시된 결과 반환)
   *
   * (product: Product | FavoriteItem):
   * - Product 타입 또는 FavoriteItem 타입 둘 다 받을 수 있습니다 (유니온 타입).
   * - index.tsx에서는 NormalizedProduct(Product 확장)를 전달합니다.
   * - favorites.tsx에서는 FavoriteItem을 전달합니다.
   */
  const toggleFavorite = useCallback(
    (product: Product | FavoriteItem) => {
      // 방어적 코딩: product나 id가 없으면 처리하지 않습니다.
      if (!product || product.id === undefined || product.id === null) {
        return;
      }

      // String(): 숫자든 문자열이든 항상 String으로 변환합니다.
      const productId = String(product.id);

      // .some(): 배열에 조건을 만족하는 항목이 하나라도 있으면 true를 반환합니다.
      // Java의 Stream.anyMatch()와 완전히 같습니다.
      const alreadyExists = favorites.some((fav) => fav.id === productId);

      if (alreadyExists) {
        /**
         * 이미 찜된 상품이면 → 제거
         *
         * setFavorites(prevFavorites => ...):
         * - 상태 업데이트 함수(functional update) 형태입니다.
         * - prevFavorites: 이전 favorites 값을 매개변수로 받습니다.
         * - 이 형태는 비동기 상태 업데이트에서 최신 값을 보장합니다.
         * Java 비유: this.favorites.removeIf(fav -> fav.getId().equals(productId));
         *
         * .filter(): 조건을 만족하는 항목만 남긴 새 배열을 반환합니다.
         * fav.id !== productId: 클릭한 상품 ID와 다른 항목만 남깁니다.
         * Java의 Stream.filter().collect(toList())와 같습니다.
         */
        setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== productId));
      } else {
        /**
         * 아직 찜하지 않은 상품이면 → 추가
         *
         * FavoriteItem 객체 구성:
         * 'brandCode' in product:
         * - product 객체에 'brandCode' 필드가 있는지 확인합니다.
         * - Product 타입에는 없고 NormalizedProduct에만 있는 필드입니다.
         * - Java의 instanceof 또는 reflection으로 필드 존재 여부 확인과 유사합니다.
         *
         * 'brandCode' in product ? product.brandCode : product.brand:
         * - brandCode 필드가 있으면 사용하고, 없으면 brand 코드를 사용합니다.
         */
        const favoriteItem = toFavoriteItem(product);

        /**
         * 중복 체크 후 배열에 추가
         *
         * setFavorites((prevFavorites) => { ... }):
         * - functional update 형태로 최신 favorites 값을 기반으로 업데이트합니다.
         *
         * [...prevFavorites, favoriteItem]:
         * - 스프레드 연산자(...)로 기존 배열을 펼치고 새 항목을 뒤에 추가합니다.
         * - 기존 배열을 직접 수정하지 않고 새 배열을 반환합니다 (불변성 유지).
         * - Java의 new ArrayList<>(prevFavorites); list.add(favoriteItem);와 유사합니다.
         *
         * 왜 배열을 직접 수정하지 않나요?
         * React의 상태 관리 원칙: 상태를 직접 변경하면 React가 변경을 감지하지 못합니다.
         * 항상 새 배열/객체를 반환해야 React가 리렌더를 트리거합니다.
         */
        setFavorites((prevFavorites) => {
          // 동시성 문제 방지: 이미 추가되어 있으면 중복 추가 안 함
          if (prevFavorites.some((fav) => fav.id === productId)) {
            return prevFavorites;
          }
          return [...prevFavorites, favoriteItem]; // 새 배열 반환
        });
      }
    },
    [favorites] // favorites가 바뀔 때만 함수를 새로 생성
  );

  /**
   * isFavorite - 특정 상품이 찜 목록에 있는지 확인하는 함수
   *
   * @param productId - 확인할 상품 ID (string 또는 number)
   * @returns boolean (찜되어 있으면 true, 아니면 false)
   *
   * String(productId): 숫자 ID도 문자열로 변환하여 일관되게 비교합니다.
   * .some(): 조건 만족 항목이 하나라도 있으면 true
   */
  const isFavorite = useCallback(
    (productId: string | number): boolean => {
      const normalizedId = String(productId);
      return favorites.some((fav) => fav.id === normalizedId);
    },
    [favorites] // favorites가 바뀔 때만 함수를 재생성
  );

  /**
   * getFavoriteCount - 찜한 상품 수를 반환하는 함수
   *
   * .length: 배열의 길이(항목 수)를 반환합니다.
   * Java의 list.size()와 같습니다.
   *
   * 왜 직접 favorites.length를 쓰지 않고 함수로 감싸나요?
   * - 컴포넌트가 favorites 배열 자체에 의존하지 않고
   *   "개수"만 알고 싶을 때 편리합니다.
   * - 향후 필터링 로직(예: 특정 브랜드의 찜 개수)을 추가하기 쉽습니다.
   */
  const getFavoriteCount = useCallback((): number => {
    return favorites.length;
  }, [favorites]);

  /**
   * checkPriceDrops - 가격 인하 알림 체크 함수 (현재는 시뮬레이션)
   *
   * 실제 서비스에서는 찜한 상품들의 현재 가격을 서버에서 조회하여
   * 저장된 가격과 비교해야 합니다.
   *
   * 현재 구현: 10% 확률로 랜덤 상품을 선택하여 가격 인하를 가장합니다.
   * Math.random(): 0 이상 1 미만의 랜덤 숫자 → 0.9보다 크면 약 10% 확률
   *
   * 반환 타입:
   * { hasDrop: boolean; product?: FavoriteItem; message?: string }
   * - hasDrop이 true일 때만 product와 message가 의미있는 값을 가집니다.
   * - TypeScript의 ? (optional): 있을 수도 없을 수도 있는 필드
   */
  const checkPriceDrops = useCallback(() => {
    if (favorites.length > 0 && Math.random() > 0.9) {
      // Math.floor(): 소수점 버림 (내림)
      // Math.random() * favorites.length: 0 이상 favorites.length 미만의 랜덤 숫자
      // → 배열의 유효한 인덱스 범위 내의 랜덤 숫자
      const randomProduct = favorites[Math.floor(Math.random() * favorites.length)];
      return {
        hasDrop: true,
        product: randomProduct,
        message: `${randomProduct.brand} ${randomProduct.name} 상품 가격이 인하되었습니다!`,
      };
    }
    return { hasDrop: false };
  }, [favorites]);

  /**
   * 훅 반환값 — 이 훅을 사용하는 컴포넌트가 받을 값과 함수들
   *
   * 객체 단축 표기법(shorthand property):
   * { favorites: favorites, ... } 대신 { favorites, ... } 처럼 씁니다.
   * 키와 값의 이름이 같을 때 사용 가능합니다.
   *
   * Java 비유: return new UseFavoritesResult(favorites, toggleFavorite, ...);
   */
  return {
    favorites,      // 찜한 상품 배열
    toggleFavorite, // 찜 추가/제거 함수
    isFavorite,     // 찜 여부 확인 함수
    getFavoriteCount, // 찜 개수 반환 함수
    checkPriceDrops,  // 가격 인하 체크 함수
    isInitialized,  // 초기화 완료 여부
  };
}
