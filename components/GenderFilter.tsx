/**
 * GenderFilter.tsx - 성별 필터 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * "전체 / 여성 / 남성" 버튼을 렌더링하고, 클릭하면 선택된 성별을 부모에게 알립니다.
 * 선택된 버튼 아래에 슬라이딩 인디케이터(바)가 spring 애니메이션으로 이동합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 상태를 부모로 올리는 패턴 (Lifting State Up)
 * ═══════════════════════════════════════════════════════════════
 * 이 컴포넌트는 자체 상태를 갖지 않습니다.
 * - selectedGender (현재 선택): 부모(index.tsx)가 관리하고 props로 내려줍니다.
 * - onGenderChange (변경 함수): 클릭 시 부모의 상태 변경 함수를 호출합니다.
 *
 * 왜 이렇게 하나요?
 * BrandFilter, GenderFilter, CategoryFilter가 서로 조합되어 필터링됩니다.
 * 모든 필터 상태를 공통 부모(index.tsx)에서 관리해야
 * 서로 다른 필터가 올바르게 함께 작동합니다.
 *
 * Java/Spring 비유: MVC의 Controller가 상태를 관리하고 View에 전달하는 것과 같습니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * useLayoutEffect vs useEffect
 * ═══════════════════════════════════════════════════════════════
 * - useEffect:       브라우저가 화면을 그린(paint) 후 실행됩니다.
 * - useLayoutEffect: DOM이 업데이트된 직후, 브라우저 paint 전에 실행됩니다.
 *
 * 이 컴포넌트에서 useLayoutEffect를 쓰는 이유:
 * 선택된 버튼의 DOM 위치(offsetLeft, offsetWidth)를 읽어야 합니다.
 * useEffect에서 읽으면 화면이 이미 그려진 후라 인디케이터가 잠깐 잘못된 위치에 보일 수 있습니다.
 * useLayoutEffect에서 읽으면 페인트 전에 위치를 계산하여 깜빡임이 없습니다.
 *
 * TypeScript 문법 포인트:
 * - interface: 객체 구조 정의
 * - Gender | 'all': 유니온 타입 (Gender 코드 또는 'all')
 * - useRef<HTMLDivElement>(null): DOM 요소 참조를 위한 제네릭 useRef
 * - as HTMLElement | null: 타입 단언 (TypeScript에 타입을 알려줌)
 */

// useRef: DOM 요소 참조용
// useState: 인디케이터의 위치와 준비 상태를 관리
import { useRef, useState } from 'react';

// 이 컴포넌트 전용 CSS 모듈
import styles from '../styles/GenderFilter.module.css';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';

// import type: 타입 정보만 가져옵니다 (빌드된 JS에 포함 안 됨)
import type { Gender } from '../types';

/**
 * GenderItem - 성별 버튼 하나의 데이터 구조
 *
 * code: 필터에 사용되는 내부 코드값 ('all', 'WOMAN', 'MAN')
 * name: 화면에 표시될 텍스트 ('전체', '여성', '남성')
 *
 * Gender | 'all': Gender 타입('MAN' | 'WOMAN' | 'UNISEX') 또는 'all' 중 하나
 */
interface GenderItem {
  code: Gender | 'all';
  name: string;
}

/**
 * GenderFilterProps - 컴포넌트가 부모로부터 받는 props 구조
 *
 * selectedGender: 현재 선택된 성별 코드 (부모가 관리하는 상태)
 * onGenderChange: 성별이 바뀔 때 부모에게 알리는 콜백 함수
 *   (genderCode: Gender | 'all') => void: 성별 코드를 받고 반환값 없는 함수 타입
 *   Java 비유: Consumer<String> onGenderChange
 */
interface GenderFilterProps {
  selectedGender: Gender | 'all';
  onGenderChange: (genderCode: Gender | 'all') => void;
}

/**
 * GENDERS - 화면에 표시할 성별 버튼 목록
 *
 * 정적 배열: 앱 실행 중 변하지 않는 고정 데이터입니다.
 * 컴포넌트 외부에 선언하면 렌더링마다 새로 생성되지 않습니다. (성능 최적화)
 *
 * GenderItem[]: GenderItem 타입의 배열
 */
const GENDERS: GenderItem[] = [
  { code: 'all', name: '전체' },    // 모든 성별 표시
  { code: 'WOMAN', name: '여성' },  // 여성 상품만 표시
  { code: 'MAN', name: '남성' },    // 남성 상품만 표시
];

/**
 * GenderFilter 컴포넌트
 *
 * 부모(index.tsx)에서 이렇게 사용합니다:
 * <GenderFilter
 *   selectedGender={selectedGender}  // 현재 선택값을 props로 전달
 *   onGenderChange={setSelectedGender}  // 변경 함수를 props로 전달
 * />
 */
function GenderFilter({ selectedGender, onGenderChange }: GenderFilterProps) {
  /**
   * containerRef - 컨테이너 DOM 요소 참조
   *
   * useRef<HTMLDivElement>(null):
   * - <HTMLDivElement>: 이 ref가 가리킬 요소 타입 (div 요소)
   * - null: 초기값 (아직 DOM에 연결 전)
   * - JSX에서 ref={containerRef}로 연결하면 containerRef.current에 실제 div가 담깁니다.
   *
   * offsetLeft 계산에 사용됩니다:
   * 선택된 버튼의 containerRef 기준 왼쪽 위치를 구해야 하므로 컨테이너 참조가 필요합니다.
   */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * indicator 상태 — 슬라이딩 인디케이터의 위치와 상태
   *
   * left: 인디케이터의 왼쪽 위치 (px)
   * width: 인디케이터의 너비 (선택된 버튼 너비와 동일, px)
   * ready: 초기 위치 설정 완료 여부 (true이면 transition 애니메이션 적용)
   *
   * 왜 ready 상태가 필요한가요?
   * 컴포넌트가 처음 렌더될 때 인디케이터가 left=0에서 시작하면
   * 실제 선택된 버튼 위치로 animated하게 이동합니다 (첫 렌더 깜빡임).
   * ready=false일 때 transition을 'none'으로 하여 즉시 이동시킵니다.
   */
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  /**
   * useLayoutEffect — 선택된 버튼의 위치를 읽어 인디케이터를 이동시킵니다.
   *
   * 의존성: [selectedGender]
   * → selectedGender가 바뀔 때마다 (버튼 클릭 시) 실행됩니다.
   *
   * containerRef.current.querySelector('[aria-pressed="true"]'):
   * - querySelector: CSS 선택자로 하위 요소를 찾습니다.
   * - '[aria-pressed="true"]': aria-pressed 속성이 "true"인 요소를 찾습니다.
   * - → 현재 선택된(aria-pressed="true") 버튼 요소를 반환합니다.
   *
   * as HTMLElement | null: 타입 단언
   * - querySelector는 Element | null을 반환합니다.
   * - HTMLElement로 단언해야 offsetLeft, offsetWidth 등의 속성에 접근할 수 있습니다.
   *
   * btn.offsetLeft: 컨테이너 기준 버튼의 왼쪽 위치 (px)
   * btn.offsetWidth: 버튼의 너비 (px)
   *
   * setIndicator(...): 인디케이터 상태를 업데이트합니다.
   * → React가 인디케이터 요소를 새 위치로 이동시킵니다.
   * → CSS transition이 적용되어 부드럽게 이동합니다.
   */
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return; // 컨테이너가 없으면 스킵

    // aria-pressed="true"인 버튼 (= 현재 선택된 버튼)을 찾습니다.
    const btn = containerRef.current.querySelector('[aria-pressed="true"]') as HTMLElement | null;
    if (!btn) return; // 선택된 버튼이 없으면 스킵

    // 버튼의 위치와 너비를 읽어 인디케이터 상태를 업데이트합니다.
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true });
  }, [selectedGender]); // selectedGender가 바뀔 때마다 실행

  /**
   * JSX 반환 — 버튼 그룹 UI
   *
   * role="radiogroup": 이 요소가 라디오 버튼 그룹임을 스크린 리더에게 알립니다.
   *   (하나만 선택할 수 있는 버튼 그룹)
   * aria-label="성별 필터": 그룹의 목적을 설명합니다.
   * ref={containerRef}: 이 div를 containerRef와 연결합니다.
   */
  return (
    <div className={styles.container} ref={containerRef} role="radiogroup" aria-label="성별 필터">
      {/**
       * 슬라이딩 인디케이터 — 선택된 버튼 아래에서 spring 애니메이션으로 이동하는 바
       *
       * style 인라인 속성:
       * - left: `${indicator.left}px`: 픽셀 단위 왼쪽 위치 (예: "84px")
       * - width: `${indicator.width}px`: 버튼과 동일한 너비
       * - opacity: ready ? 1 : 0: 준비 전에는 숨겨서 첫 렌더 깜빡임 방지
       * - transition: ready이면 spring 애니메이션, 아니면 transition 없음 (즉시 이동)
       *
       * `var(--ease-spring)`: CSS 변수로 정의된 spring 곡선 (globals.css에서 정의)
       * aria-hidden="true": 스크린 리더에서 이 장식 요소를 무시하도록 합니다.
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
       * GENDERS 배열을 .map()으로 버튼들을 렌더링합니다.
       *
       * .map(콜백): 배열의 각 항목을 다른 값으로 변환하여 새 배열을 만듭니다.
       * 여기서는 GenderItem → JSX <button> 요소로 변환합니다.
       * Java 비유: stream.map(gender -> createButton(gender)).collect(toList())
       *
       * key={gender.code}: 리스트 렌더링에서 각 항목의 고유 식별자입니다.
       * - React는 key로 어떤 버튼이 바뀌었는지 효율적으로 추적합니다.
       * - key가 없으면 콘솔에 경고가 발생합니다.
       * - 순서가 변할 수 있는 목록에서는 인덱스(i) 대신 고유 ID를 사용합니다.
       */}
      {GENDERS.map((gender) => {
        // isSelected: 현재 버튼이 선택된 버튼인지 확인합니다.
        // selectedGender === gender.code: 전달받은 현재 선택값과 이 버튼의 코드를 비교합니다.
        const isSelected = selectedGender === gender.code;

        // 동적 클래스명: isSelected에 따라 styles.selected를 추가하거나 제거합니다.
        // 템플릿 리터럴로 문자열을 조합합니다.
        const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`;

        return (
          <button
            key={gender.code}
            className={buttonClassName}
            onClick={() => onGenderChange(gender.code)} // 클릭 시 부모의 onGenderChange 호출
            // aria-pressed: 버튼의 "눌린" 상태를 스크린 리더에게 알립니다.
            // true이면 "선택됨", false이면 "선택 안 됨"을 읽어줍니다.
            aria-pressed={isSelected}
            aria-label={`${gender.name} 상품만 보기`} // 스크린 리더용 설명
            type="button" // form submit 방지 (기본 type="submit"을 override)
          >
            <span>{gender.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * export default: 이 컴포넌트를 기본 내보내기로 선언합니다.
 * 다른 파일에서: import GenderFilter from './GenderFilter'
 */
export default GenderFilter;
