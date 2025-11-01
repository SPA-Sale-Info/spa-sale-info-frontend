/**
 * BrandFilter.js - 브랜드 필터 컴포넌트
 *
 * 이 컴포넌트는 사용자가 특정 브랜드의 상품만 볼 수 있도록 필터링 기능을 제공합니다.
 *
 * 컴포넌트란?
 * - UI의 재사용 가능한 독립적인 조각
 * - 레고 블록처럼 여러 컴포넌트를 조합하여 화면을 구성
 * - 각 컴포넌트는 자신의 로직과 UI를 캡슐화
 *
 * Props (Properties)란?
 * - 부모 컴포넌트로부터 전달받는 데이터
 * - 읽기 전용 (Read-only)
 * - 함수의 매개변수와 비슷한 개념
 */

import styles from '../styles/BrandFilter.module.css'

/**
 * 브랜드 목록 상수
 *
 * 왜 컴포넌트 밖에 선언하나요?
 * - 컴포넌트가 리렌더링될 때마다 다시 생성되지 않도록
 * - 메모리 효율성과 성능 향상
 * - 여러 곳에서 재사용 가능
 *
 * const란?
 * - 재할당이 불가능한 상수 (constant)
 * - let은 재할당 가능, var는 구식 문법 (사용 권장하지 않음)
 */
const BRANDS = [
  /**
   * 객체 배열 구조
   * - 각 브랜드는 code, name, emoji 속성을 가진 객체
   * - code: 브랜드를 식별하는 고유 코드 (API 요청 시 사용)
   * - name: 화면에 표시될 브랜드 이름
   * - emoji: 시각적 요소 (선택사항)
   */
  { code: 'all', name: '전체', emoji: '🛍️' },
  { code: 'HM', name: 'H&M', emoji: '🔴' },
  { code: 'ZARA', name: 'ZARA', emoji: '⚫' },
  { code: 'UNIQLO', name: 'UNIQLO', emoji: '🔵' },
  { code: 'MUJI', name: 'MUJI', emoji: '⚪' },
  { code: 'COS', name: 'COS', emoji: '⬛' },
  // 추가 브랜드는 여기에 계속 추가하면 됩니다
]

/**
 * BrandFilter 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.selectedBrand - 현재 선택된 브랜드 코드
 * @param {Function} props.onBrandChange - 브랜드 변경 시 호출될 함수
 * @returns {JSX.Element} 브랜드 필터 UI
 *
 * 구조 분해 할당 (Destructuring):
 * - props 객체에서 필요한 속성만 추출
 * - function BrandFilter(props) 대신
 * - function BrandFilter({ selectedBrand, onBrandChange })처럼 사용
 * - 더 간결하고 읽기 쉬운 코드
 */
function BrandFilter({ selectedBrand, onBrandChange }) {
  /**
   * 브랜드 클릭 핸들러
   *
   * @param {string} brandCode - 클릭된 브랜드 코드
   *
   * 이벤트 핸들러란?
   * - 사용자의 행동(클릭, 입력 등)에 반응하는 함수
   * - 네이밍 컨벤션: handle + 이벤트명 (예: handleClick, handleChange)
   *
   * 왜 별도 함수로 만드나요?
   * - 코드의 가독성 향상
   * - 재사용 가능
   * - 로직 분리 (추후 유효성 검사 등 추가 가능)
   */
  const handleBrandClick = (brandCode) => {
    /**
     * 부모 컴포넌트로부터 전달받은 onBrandChange 함수를 호출
     *
     * 이것이 바로 "상태 끌어올리기(Lifting State Up)" 패턴입니다:
     * 1. 자식 컴포넌트(BrandFilter)에서 브랜드가 클릭됨
     * 2. 자식이 부모의 함수(onBrandChange)를 호출
     * 3. 부모 컴포넌트(Home)의 상태가 업데이트됨
     * 4. 부모와 모든 자식 컴포넌트가 리렌더링됨
     *
     * 왜 이렇게 하나요?
     * - React의 데이터 흐름은 단방향(위에서 아래로)
     * - 자식이 직접 부모의 상태를 변경할 수 없음
     * - 부모가 제공한 함수를 통해서만 상태 변경 가능
     */
    onBrandChange(brandCode)
  }

  /**
   * JSX 반환
   *
   * 여기서 주목할 점:
   * - className을 동적으로 설정 (템플릿 리터럴 사용)
   * - 배열을 map()으로 순회하며 UI 생성
   * - 조건부 클래스명 적용
   */
  return (
    <div className={styles.filterContainer}>
      {/**
       * 브랜드 버튼 그룹
       */}
      <div className={styles.buttonGroup}>
        {/**
         * .map() 메서드로 배열 렌더링
         *
         * BRANDS 배열의 각 요소를 순회하며 버튼을 생성합니다
         *
         * 매개변수:
         * - brand: 현재 순회 중인 배열 요소
         * - index: 현재 요소의 인덱스 (0, 1, 2, ...)
         *
         * key 속성의 중요성:
         * - React가 리스트의 각 항목을 식별하는데 사용
         * - 고유한 값이어야 함 (brand.code가 고유하므로 사용)
         * - 성능 최적화와 버그 방지에 필수
         *
         * 왜 index를 key로 사용하면 안 되나요?
         * - 배열의 순서가 바뀌면 문제 발생
         * - 항목이 추가/삭제되면 잘못된 항목이 업데이트될 수 있음
         */}
        {BRANDS.map((brand) => {
          /**
           * 현재 브랜드가 선택되었는지 확인
           *
           * === 연산자:
           * - 값과 타입이 모두 같은지 엄격하게 비교
           * - == 는 타입 변환 후 비교 (사용 권장하지 않음)
           */
          const isSelected = selectedBrand === brand.code

          /**
           * 동적 클래스명 생성
           *
           * 템플릿 리터럴 (백틱 ``)로 문자열 조합:
           * - ${표현식}으로 변수나 표현식 삽입 가능
           *
           * 삼항 연산자로 조건부 클래스 추가:
           * - isSelected가 true면 styles.selected 추가
           * - isSelected가 false면 빈 문자열 추가
           *
           * 예시:
           * - 선택됨: "button selected"
           * - 선택 안 됨: "button "
           */
          const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`

          return (
            <button
              key={brand.code}
              className={buttonClassName}
              /**
               * onClick 이벤트 핸들러
               *
               * 화살표 함수를 사용하는 이유:
               * - handleBrandClick(brand.code)를 바로 쓰면 렌더링 시 즉시 실행됨
               * - () => handleBrandClick(brand.code)로 감싸면 클릭 시에만 실행됨
               *
               * 이벤트 핸들러 작성 방법 비교:
               * 1. onClick={() => handleBrandClick(brand.code)} ✅ 매개변수 전달 시
               * 2. onClick={handleBrandClick} ✅ 매개변수 없을 시
               * 3. onClick={handleBrandClick(brand.code)} ❌ 렌더링 시 즉시 실행됨
               */
              onClick={() => handleBrandClick(brand.code)}
              /**
               * aria-pressed 속성
               *
               * 접근성(Accessibility) 향상을 위한 ARIA 속성:
               * - 스크린 리더가 버튼의 선택 상태를 읽어줍니다
               * - 시각 장애인 사용자를 위한 중요한 속성
               * - 웹 표준과 접근성을 준수하는 좋은 습관
               */
              aria-pressed={isSelected}
            >
              {/**
               * 버튼 내용
               *
               * JSX 내에서 JavaScript 표현식 사용:
               * - {}로 감싸면 JavaScript 코드 실행 가능
               * - {brand.emoji}는 brand 객체의 emoji 속성 값을 출력
               *
               * 공백 추가:
               * - {' '}는 이모지와 이름 사이에 공백을 추가
               * - JSX에서 여러 공백은 하나로 합쳐지므로 명시적으로 추가
               */}
              {brand.emoji} {brand.name}
            </button>
          )
        })}
      </div>

      {/**
       * 선택된 브랜드 정보 표시
       *
       * .find() 메서드:
       * - 배열에서 조건에 맞는 첫 번째 요소를 반환
       * - 찾지 못하면 undefined 반환
       *
       * 화살표 함수 (Arrow Function):
       * - (brand) => brand.code === selectedBrand
       * - 매개변수가 하나면 ()를 생략 가능: brand => ...
       * - 한 줄 표현식이면 return과 {}를 생략 가능
       *
       * 옵셔널 체이닝 (Optional Chaining) ?.
       * - currentBrand?.name
       * - currentBrand가 undefined나 null이면 에러 없이 undefined 반환
       * - currentBrand가 존재하면 .name 속성에 접근
       *
       * || 연산자 (OR):
       * - 왼쪽 값이 falsy면 오른쪽 값을 반환
       * - falsy: false, 0, '', null, undefined, NaN
       */}
      <div className={styles.selectedInfo}>
        <p>
          현재 선택: <strong>{BRANDS.find(brand => brand.code === selectedBrand)?.name || '전체'}</strong>
        </p>
      </div>
    </div>
  )
}

/**
 * 컴포넌트를 export하여 다른 파일에서 사용할 수 있게 합니다
 *
 * export와 import:
 * - export: 이 파일의 함수/변수를 외부에 공개
 * - import: 다른 파일의 export된 함수/변수를 가져옴
 *
 * export 방식:
 * 1. export default BrandFilter
 *    - 파일당 하나만 가능
 *    - import BrandFilter from './BrandFilter'
 * 2. export { BrandFilter }
 *    - 여러 개 가능
 *    - import { BrandFilter } from './BrandFilter'
 */
export default BrandFilter
