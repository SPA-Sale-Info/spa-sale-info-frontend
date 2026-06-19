/**
 * CategoryFilter.tsx - 카테고리 필터 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 상의 / 하의 / 아우터 / 신발 / 기타 카테고리 버튼을 렌더링합니다.
 * 버튼을 클릭하면 해당 카테고리의 상품만 필터링됩니다.
 * 선택된 버튼 아래에 슬라이딩 인디케이터(바)가 spring 애니메이션으로 이동합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 상태를 부모로 올리는 패턴 (Lifting State Up)
 * ═══════════════════════════════════════════════════════════════
 * 이 컴포넌트는 자체적으로 selectedCategory 상태를 갖지 않습니다.
 * 부모(index.tsx)가 상태를 관리하고 props로 내려줍니다.
 * 클릭 시 onCategoryChange 콜백으로 부모에게 변경을 알립니다.
 * → GenderFilter, BrandFilter와 동일한 패턴입니다.
 *
 * 왜 이렇게 하나요?
 * 브랜드 + 성별 + 카테고리 필터가 함께 작동하려면, 세 필터의 상태가
 * 공통 부모(index.tsx)에 있어야 합니다. 각 필터가 자기 상태를 가지면
 * 서로 조합할 때 동기화 문제가 생깁니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 슬라이딩 인디케이터 — GenderFilter와 동일한 패턴
 * ═══════════════════════════════════════════════════════════════
 * 선택된 버튼 아래에 수평 바(인디케이터)가 spring 애니메이션으로 이동합니다.
 * - useRef: 버튼 컨테이너 DOM 요소를 참조하기 위해 사용합니다.
 * - useLayoutEffect: DOM이 업데이트된 직후, 화면이 그려지기 전에 실행됩니다.
 *   → 버튼의 픽셀 위치를 정확하게 읽어 인디케이터 위치를 계산합니다.
 *   → useEffect 대신 useLayoutEffect를 쓰는 이유:
 *      useEffect는 화면이 그려진 후 실행되어 인디케이터가 잠깐 잘못된 위치에 보입니다.
 *      useLayoutEffect는 페인트 전에 실행되어 깜빡임이 없습니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - interface: 객체 구조 정의
 * - Category | 'all': 유니온 타입 — Category 코드 또는 문자열 'all' 중 하나
 * - useRef<HTMLDivElement>(null): DOM 요소 참조를 위한 제네릭 useRef
 * - as HTMLElement | null: 타입 단언 — querySelector가 반환하는 Element를 HTMLElement로 좁힘
 * - (categoryCode: Category | 'all') => void: 함수 타입 — 인자 하나를 받고 반환값 없음
 */

// useRef: DOM 요소 참조용 (컨테이너 div를 참조합니다)
// useState: 인디케이터의 위치·너비·준비 상태를 관리합니다
import { useRef, useState } from 'react';

// 이 컴포넌트 전용 CSS 모듈 — 클래스명이 자동으로 스코프됩니다
import styles from '../styles/CategoryFilter.module.css';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';

// import type: 타입 정보만 가져옵니다 (빌드된 JS에 포함 안 됨)
// Category는 types/index.ts에서 정의된 유니온 타입입니다
import type { Category } from '../types';

/**
 * CategoryItem - 카테고리 버튼 하나의 데이터 구조
 *
 * code: 필터에 사용하는 내부 코드값 ('all', 'TOP', 'BOTTOM' 등)
 * label: 화면에 표시할 텍스트 ('전체', '상의', '하의' 등)
 *
 * Category | 'all': Category 유니온 타입('TOP'|'BOTTOM'|'OUTER'|'SHOES'|'ETC') 또는 'all'
 * Java enum 비유: CategoryCode.TOP, CategoryCode.BOTTOM, ... 또는 "all" String
 */
interface CategoryItem {
  code: Category | 'all';
  label: string;
}

/**
 * CategoryFilterProps - 부모(index.tsx)가 이 컴포넌트에 전달하는 props의 구조
 *
 * selectedCategory: 현재 선택된 카테고리 코드 (부모가 관리하는 상태)
 * onCategoryChange: 카테고리가 바뀔 때 부모에게 알리는 콜백 함수
 *   (categoryCode: Category | 'all') => void
 *   "카테고리 코드를 받고 아무것도 반환하지 않는 함수"
 *   Java 비유: Consumer<String> onCategoryChange
 */
interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (categoryCode: Category | 'all') => void;
}

/**
 * CATEGORIES - 화면에 표시할 카테고리 목록 (정적 데이터)
 *
 * 컴포넌트 외부에 선언하는 이유:
 * 이 배열은 절대 바뀌지 않습니다.
 * 컴포넌트 내부에 두면 렌더링마다 새 배열 객체가 생성됩니다 (메모리 낭비).
 * 외부에 두면 앱 시작 시 딱 한 번만 생성됩니다. (성능 최적화)
 *
 * CategoryItem[]: "CategoryItem 타입의 배열" — Java List<CategoryItem>과 동일
 *
 * CATEGORY_GROUPS (index.tsx)와 관계:
 * 이 배열은 UI 버튼을 위한 것입니다 (label 포함).
 * CATEGORY_GROUPS는 실제 API 카테고리(SHIRT, T_SHIRT 등)를 그룹으로 매핑합니다.
 */
const CATEGORIES: CategoryItem[] = [
  { code: 'all', label: '전체' },    // 모든 카테고리 표시
  { code: 'TOP', label: '상의' },    // 셔츠, 티셔츠, 니트, 블라우스 등
  { code: 'BOTTOM', label: '하의' }, // 바지, 청바지, 반바지, 스커트 등
  { code: 'OUTER', label: '아우터' }, // 재킷, 코트, 패딩 등
  { code: 'SHOES', label: '신발' },  // 모든 신발
  { code: 'ETC', label: '기타' },    // 액세서리, 가방, 기타
];

/**
 * CategoryFilter 컴포넌트
 *
 * 부모(index.tsx)에서 이렇게 사용합니다:
 * <CategoryFilter
 *   selectedCategory={selectedCategory}   // 현재 선택값을 props로 전달
 *   onCategoryChange={setSelectedCategory} // 변경 함수를 props로 전달
 * />
 *
 * { selectedCategory, onCategoryChange }: CategoryFilterProps
 * → 구조 분해 할당으로 props를 바로 꺼냅니다.
 * → Java에서 메서드 파라미터에서 바로 꺼내는 것과 비슷하지만, 한 번에 객체에서 꺼냅니다.
 */
function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  /**
   * containerRef - 버튼 그룹 컨테이너 DOM 요소 참조
   *
   * useRef<HTMLDivElement>(null):
   * - <HTMLDivElement>: 이 ref가 참조할 요소 타입 (div 요소)
   * - null: 초기값 — 아직 DOM에 연결되지 않은 상태
   * - JSX에서 ref={containerRef}로 연결하면 containerRef.current에 실제 div가 담깁니다.
   *
   * 왜 필요한가요?
   * 선택된 버튼의 위치(offsetLeft)를 계산할 때 컨테이너(부모) 기준이 필요합니다.
   * containerRef로 컨테이너 DOM을 직접 참조해 버튼의 상대 위치를 구합니다.
   *
   * Java 비유: DOM 요소에 대한 참조를 직접 들고 있는 필드(멤버 변수)와 유사합니다.
   */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * indicator 상태 — 슬라이딩 인디케이터(선택 표시 바)의 위치와 표시 상태
   *
   * useState({ left: 0, width: 0, ready: false }):
   * - left: 인디케이터의 왼쪽 위치(px) — 선택된 버튼의 offsetLeft 값
   * - width: 인디케이터의 너비(px) — 선택된 버튼의 offsetWidth 값
   * - ready: 첫 위치 설정 완료 여부
   *
   * ready 상태가 왜 필요한가요?
   * 처음 렌더 시 인디케이터는 left=0에서 시작합니다.
   * CSS transition이 있으면 0 → 실제 위치로 애니메이션이 실행됩니다 (원하지 않는 동작).
   * ready=false일 때 transition='none'으로 즉시 이동시켜 이 문제를 방지합니다.
   * 위치가 계산되면 ready=true가 되어 이후부터 transition 애니메이션이 적용됩니다.
   */
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  /**
   * useLayoutEffect — 선택된 버튼의 DOM 위치를 읽어 인디케이터를 이동시킵니다.
   *
   * 실행 시점: DOM이 업데이트된 직후, 브라우저가 화면을 그리기(paint) 전
   * 의존성: [selectedCategory]
   * → selectedCategory가 바뀔 때마다 (버튼 클릭 시) 실행됩니다.
   *
   * ──────────────────────────────────────────────────────────────────
   * useLayoutEffect를 쓰는 이유 (useEffect 대신):
   * ──────────────────────────────────────────────────────────────────
   * useEffect: 브라우저가 화면을 그린 후 실행
   *   → 잘못된 위치로 화면이 한 번 그려진 후 인디케이터가 이동합니다 (깜빡임 발생)
   * useLayoutEffect: DOM이 업데이트된 직후, 화면을 그리기 전 실행
   *   → 올바른 위치로 먼저 계산하고, 그 위치로 화면이 처음부터 그려집니다 (깜빡임 없음)
   *
   * ──────────────────────────────────────────────────────────────────
   * 코드 설명:
   * ──────────────────────────────────────────────────────────────────
   * containerRef.current.querySelector('[aria-pressed="true"]'):
   * - querySelector: CSS 선택자로 자식 요소를 찾는 DOM 메서드입니다.
   * - '[aria-pressed="true"]': aria-pressed 속성이 "true"인 요소를 찾습니다.
   *   → 현재 선택된(aria-pressed="true"로 설정된) 버튼을 찾습니다.
   *
   * as HTMLElement | null: 타입 단언
   * - querySelector는 Element | null을 반환합니다.
   * - HTMLElement로 단언해야 offsetLeft, offsetWidth 속성에 접근 가능합니다.
   * - Java의 (HTMLElement) obj 형변환과 유사하지만, 런타임 검사는 없습니다.
   *
   * btn.offsetLeft: 컨테이너 기준 버튼의 왼쪽 시작 위치(픽셀)
   * btn.offsetWidth: 버튼의 실제 너비(픽셀)
   */
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return; // 컨테이너가 아직 DOM에 없으면 스킵

    // 현재 선택된 버튼(aria-pressed="true")을 컨테이너 내에서 찾습니다.
    const btn = containerRef.current.querySelector('[aria-pressed="true"]') as HTMLElement | null;
    if (!btn) return; // 선택된 버튼이 없으면 스킵

    // 버튼의 위치(left)와 너비(width)를 읽어 인디케이터 상태를 업데이트합니다.
    // ready=true: 이제 CSS transition 애니메이션이 적용됩니다.
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true });
  }, [selectedCategory]); // selectedCategory가 바뀔 때마다 실행

  /**
   * JSX 반환 — 카테고리 필터 버튼 그룹 UI
   *
   * role="radiogroup": 이 요소가 라디오 버튼 그룹임을 스크린 리더에게 알립니다.
   *   라디오 버튼 그룹은 하나만 선택할 수 있는 버튼 집합입니다.
   *   시각 장애인용 스크린 리더가 이 역할(role)을 읽어 사용자에게 알려줍니다.
   *
   * aria-label="카테고리 필터": 그룹의 목적을 스크린 리더에게 설명합니다.
   * ref={containerRef}: 이 div를 containerRef와 연결합니다.
   *   → containerRef.current가 이 div DOM 요소를 참조하게 됩니다.
   */
  return (
    <div className={styles.container} ref={containerRef} role="radiogroup" aria-label="카테고리 필터">
      {/**
       * 슬라이딩 인디케이터 — 선택된 버튼 아래를 따라 이동하는 바
       *
       * style 인라인 속성:
       * - left: `${indicator.left}px`: 픽셀 단위 왼쪽 위치 (예: "84px")
       *   → CSS left 속성은 절대/상대 위치 지정에 쓰입니다. 부모 기준 왼쪽 거리입니다.
       * - width: `${indicator.width}px`: 선택된 버튼과 동일한 너비로 설정합니다.
       * - opacity: ready ? 1 : 0: 첫 위치 계산 전에는 투명하게 숨깁니다.
       *   → 이러면 0위치에서 실제 위치로 이동하는 애니메이션이 보이지 않습니다.
       * - transition:
       *   ready이면 spring 애니메이션 적용 (left와 width가 부드럽게 이동)
       *   아직 ready가 아니면 'none' (즉시 이동, 애니메이션 없음)
       *
       * `var(--ease-spring)`: globals.css에서 정의된 CSS 커스텀 변수 (spring 곡선)
       *   CSS 변수는 var(--변수명)으로 참조합니다.
       *   spring 곡선은 빠르게 올라갔다가 살짝 튀어오르는 자연스러운 움직임입니다.
       *
       * aria-hidden="true": 이 장식 요소는 스크린 리더가 읽지 않도록 합니다.
       *   인디케이터는 시각적 장식이므로 접근성 트리에서 숨깁니다.
       */}
      <span
        className={styles.indicator}
        aria-hidden="true"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          opacity: indicator.ready ? 1 : 0,
          transition: indicator.ready
            ? 'left 380ms var(--ease-spring), width 380ms var(--ease-spring), opacity 120ms'
            : 'none',
        }}
      />

      {/**
       * CATEGORIES 배열을 .map()으로 버튼들을 렌더링합니다.
       *
       * .map(콜백): 배열의 각 항목을 JSX 요소로 변환합니다.
       * Java 비유: categories.stream().map(c -> createButton(c)).collect(toList())
       *
       * key={category.code}: 리스트 렌더링에서 각 항목의 고유 식별자입니다.
       * - React는 key로 어떤 버튼이 추가/수정/삭제됐는지 효율적으로 파악합니다.
       * - 인덱스(0, 1, 2...)보다 고유 코드('TOP', 'BOTTOM' 등)를 key로 쓰는 것이 좋습니다.
       *   순서가 바뀌어도 각 버튼을 정확히 식별할 수 있기 때문입니다.
       */}
      {CATEGORIES.map((category) => {
        /**
         * isSelected: 이 버튼이 현재 선택된 카테고리인지 확인합니다.
         *
         * selectedCategory === category.code:
         * - 부모에서 받은 현재 선택값과 이 버튼의 코드를 비교합니다.
         * - 예: selectedCategory='TOP', category.code='TOP' → isSelected=true
         * - === (엄격한 비교): 값과 타입이 모두 같아야 true입니다.
         *   Java의 .equals()와 유사합니다 (단, 기본 타입은 == 가능).
         */
        const isSelected = selectedCategory === category.code;

        /**
         * className: CSS 클래스명 동적 조합
         *
         * `${styles.button} ${isSelected ? styles.selected : ''}`:
         * - 템플릿 리터럴(`백틱`)로 문자열을 조합합니다.
         * - styles.button: 기본 버튼 스타일 (항상 적용)
         * - isSelected ? styles.selected : '': 선택된 경우 selected 클래스 추가
         *   → 선택된 버튼에 강조 스타일이 적용됩니다 (글꼴 굵기, 색상 등)
         *
         * CSS 모듈: styles.button은 빌드 시 'CategoryFilter_button__xxxx' 형태로 변환됩니다.
         * → 다른 컴포넌트의 .button 클래스와 충돌하지 않습니다.
         */
        const className = `${styles.button} ${isSelected ? styles.selected : ''}`;

        return (
          /**
           * 카테고리 선택 버튼
           *
           * key={category.code}: React가 이 버튼을 추적하는 고유 식별자
           * type="button": 폼 안에 있을 때 실수로 폼을 제출하지 않도록 명시합니다.
           *   HTML button의 기본 type은 "submit"이므로 항상 명시하는 것이 좋습니다.
           *
           * aria-pressed={isSelected}: 이 버튼의 "눌린" 상태를 스크린 리더에게 알립니다.
           *   true → "선택됨(누름)" / false → "선택 안 됨(안 누름)"
           *   useLayoutEffect에서 querySelector('[aria-pressed="true"]')로 이 값을 활용합니다.
           *
           * aria-label={`${category.label} 상품만 보기`}:
           *   버튼의 목적을 스크린 리더용으로 설명합니다.
           *   예: "상의 상품만 보기" — 시각 장애인이 버튼 기능을 이해할 수 있습니다.
           *
           * onClick={() => onCategoryChange(category.code)}:
           *   화살표 함수로 콜백을 감쌉니다.
           *   클릭 시 부모(index.tsx)로부터 받은 onCategoryChange 함수를 호출합니다.
           *   부모의 selectedCategory 상태가 변경되고, React가 리렌더를 트리거합니다.
           */
          <button
            key={category.code}
            type="button"
            className={className}
            aria-pressed={isSelected}
            aria-label={`${category.label} 상품만 보기`}
            onClick={() => onCategoryChange(category.code)}
          >
            {/**
             * 버튼 텍스트
             * category.label: CATEGORIES 배열에서 정의한 한국어 이름
             * 예: '전체', '상의', '하의', '아우터', '신발', '기타'
             */}
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * export default: 이 컴포넌트를 기본 내보내기로 선언합니다.
 * 다른 파일에서: import CategoryFilter from './CategoryFilter'
 * 기본 내보내기는 파일당 하나만 가능합니다.
 */
export default CategoryFilter;
