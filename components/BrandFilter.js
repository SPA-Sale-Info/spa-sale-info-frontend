/**
 * ============================================================================
 * BrandFilter.js - 브랜드 필터 컴포넌트 (재사용 가능한 UI 컴포넌트)
 * ============================================================================
 *
 * 🎯 Spring Boot로 비유하면?
 * - Thymeleaf의 fragment와 유사한 재사용 가능한 UI 조각
 * - JSP의 커스텀 태그와 비슷
 * - 하지만 더 강력: 자체 로직(이벤트 처리)도 포함 가능
 *
 * 📦 이 컴포넌트의 역할:
 * 1. 브랜드 버튼 목록을 화면에 그리기 (렌더링)
 * 2. 사용자가 버튼 클릭 시 부모 컴포넌트에게 알리기 (이벤트 전달)
 *
 * 🔄 데이터 흐름:
 * 부모(pages/index.js) → props로 데이터 전달 → BrandFilter
 *                      ← 콜백 함수로 이벤트 전달 ←
 *
 * Spring Boot와 비교:
 * [Thymeleaf Fragment]
 * <div th:fragment="brandFilter(selectedBrand, onBrandChange)">
 *   <button th:each="brand : ${brands}"
 *           th:classappend="${brand.code == selectedBrand ? 'selected' : ''}"
 *           th:onclick="'onBrandChange(' + ${brand.code} + ')'">
 *     <span th:text="${brand.name}"></span>
 *   </button>
 * </div>
 *
 * [React 컴포넌트 - 이 파일]
 * function BrandFilter({ selectedBrand, onBrandChange }) {
 *   return (
 *     <div>
 *       {brands.map(brand => (
 *         <button onClick={() => onBrandChange(brand.code)}>
 *           {brand.name}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 */

/**
 * Next.js의 Image 컴포넌트 임포트
 * - 일반 <img> 태그의 강화 버전
 * - 자동 이미지 최적화, 지연 로딩, 반응형 처리
 * - Spring Boot에서는 없는 기능 (프론트엔드 전용)
 */
import Image from 'next/image'

/**
 * CSS 모듈 임포트
 * - styles.button → 실제로는 'BrandFilter_button__xyz123' 같은 고유 클래스명
 * - CSS 충돌 방지 (스코핑)
 *
 * Spring Boot의 @Import나 @ComponentScan과 유사하지만
 * 이건 스타일 시트를 임포트하는 것
 */
import styles from '../styles/BrandFilter.module.css'

/**
 * ============================================================================
 * 브랜드 목록 상수 정의
 * ============================================================================
 *
 * Spring Boot로 비유:
 * public enum Brand {
 *     ALL("all", "전체", null, "🛍️"),
 *     HM("HM", "H&M", "/logos/hm.svg", null),
 *     ZARA("ZARA", "ZARA", "/logos/zara.svg", null),
 *     ...
 * }
 *
 * 왜 컴포넌트 외부에 정의하나요?
 * - 이 데이터는 렌더링할 때마다 바뀌지 않음 (상수)
 * - 컴포넌트 내부에 있으면 렌더링마다 새로 생성됨 (메모리 낭비)
 * - 외부에 있으면 한 번만 생성되고 재사용됨
 *
 * 각 브랜드 객체 구조:
 * {
 *   code: string,          // 백엔드에 보낼 브랜드 코드
 *   name: string,          // 화면에 표시할 이름
 *   logo: string | null,   // 로고 이미지 경로
 *   emoji: string,         // 로고가 없을 때 보여줄 이모지
 *   comingSoon: boolean,   // 곧 추가될 예정인지 여부
 *   bubblePosition: string // 툴팁 위치 (선택사항)
 * }
 */
const BRANDS = [
  { code: 'all', name: '전체', logo: null, emoji: '🛍️' },
  { code: 'HM', name: 'H&M', logo: '/logos/hm.svg' },
  { code: 'ZARA', name: 'ZARA', logo: '/logos/zara.svg' },
  { code: 'UNIQLO', name: 'UNIQLO', logo: '/logos/uniqlo.svg' },
  { code: 'MUJI', name: 'MUJI', logo: '/logos/muji.svg' },
  { code: 'CHARLESKEITH', name: '찰스앤키스', logo: '/logos/charleskeith.svg' },
  { code: 'COS', name: 'COS', logo: '/logos/cos.svg', noSale: true },
  { code: 'ARKET', name: 'ARKET', logo: '/logos/arket.svg', noSale: true },
  { code: 'MASSIMODUTTI', name: 'Massimo Dutti', logo: '/logos/massimodutti.svg', emoji: '🧥' },
  { code: 'MANGO', name: 'Mango', logo: '/logos/mango.svg', emoji: '🥭', comingSoon: true, bubblePosition: 'bottom' },
  { code: 'EIGHTSECONDS', name: '에잇세컨즈', logo: '/logos/eightseconds.svg', comingSoon: true },
  { code: 'MIXXO', name: '미쏘', logo: '/logos/mixxo.svg', comingSoon: true },
  { code: 'MUSINSASTANDARD', name: '무신사 스탠다드', logo: '/logos/musinsastandard.svg', comingSoon: true },
  { code: 'TOPTEN', name: '탑텐', logo: '/logos/topten.svg', comingSoon: true },
  { code: 'SPAO', name: '스파오', logo: '/logos/spao.svg', comingSoon: true },
  { code: 'GIORDANO', name: '지오다노', logo: '/logos/giordano.svg', comingSoon: true },
]

/**
 * ============================================================================
 * BrandFilter 컴포넌트 정의
 * ============================================================================
 *
 * @param {Object} props - 부모 컴포넌트로부터 받은 데이터
 * @param {string} props.selectedBrand - 현재 선택된 브랜드 코드 ('all', 'ZARA' 등)
 * @param {Function} props.onBrandChange - 브랜드 변경 시 호출할 콜백 함수
 *
 * Spring Boot MVC 패턴과 비교:
 * - props.selectedBrand → Model attribute (@ModelAttribute)
 * - props.onBrandChange → Controller 메서드 (@PostMapping)
 *
 * 구조 분해 할당 ({ selectedBrand, onBrandChange }):
 * - function BrandFilter(props)와 동일하지만 더 간결
 * - props.selectedBrand 대신 selectedBrand로 바로 사용 가능
 *
 * Java 비슷한 코드:
 * public void brandFilter(String selectedBrand, Consumer<String> onBrandChange) {
 *     // ...
 * }
 */
function BrandFilter({ selectedBrand, onBrandChange }) {

  /**
   * ============================================================================
   * 브랜드 클릭 핸들러 (이벤트 처리 함수)
   * ============================================================================
   *
   * 사용자가 브랜드 버튼을 클릭했을 때 실행되는 함수입니다.
   *
   * @param {string} brandCode - 클릭한 브랜드의 코드 ('ZARA', 'HM' 등)
   * @param {boolean} isDisabled - 버튼이 비활성화 상태인지 여부
   *
   * Spring Boot Controller 메서드와 비교:
   * @PostMapping("/brands/select")
   * public String selectBrand(
   *     @RequestParam String brandCode,
   *     @RequestParam boolean isDisabled
   * ) {
   *     if (isDisabled) {
   *         return "redirect:/";
   *     }
   *     brandService.selectBrand(brandCode);
   *     return "redirect:/products";
   * }
   *
   * 동작 원리:
   * 1. 버튼 비활성화 체크 (comingSoon 브랜드는 클릭 불가)
   * 2. 부모 컴포넌트에게 선택된 브랜드 코드 전달
   * 3. 부모가 state를 업데이트 → 화면 자동 갱신
   */
  const handleBrandClick = (brandCode, isDisabled) => {
    /**
     * Early return 패턴
     * - 조건을 만족하지 않으면 함수 즉시 종료
     * - Java의 if-else 중첩을 피하는 클린 코드 패턴
     *
     * Java:
     * if (!isDisabled) {
     *     onBrandChange(brandCode);
     * }
     */
    if (isDisabled) {
      return  // 비활성화 버튼은 아무 동작 안 함
    }

    /**
     * 콜백 함수 호출
     * - onBrandChange는 부모 컴포넌트가 전달한 함수
     * - 보통 setState 함수가 전달됨
     * - 이 함수를 호출하면 부모의 state가 업데이트됨
     *
     * 부모 컴포넌트(pages/index.js)에서:
     * <BrandFilter
     *   selectedBrand={selectedBrand}
     *   onBrandChange={setSelectedBrand}  ← 이 함수가 호출됨
     * />
     */
    onBrandChange(brandCode)
  }

  return (
    <div className={styles.filterContainer}>
      <div className={styles.buttonGroup}>
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.code
          const buttonClassName = [
            styles.button,
            isSelected ? styles.selected : '',
            brand.comingSoon ? styles.buttonDisabled : '',
          ].filter(Boolean).join(' ')

          const buttonContent = (
            <>
              {brand.logo
                ? (
                  // 로고 파일이 있으면 이미지를 보여줍니다.
                  <span className={styles.logoContainer}>
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} 로고`}
                      width={56}
                      height={24}
                      className={styles.brandLogo}
                      sizes="56px"
                    />
                  </span>
                )
                : (
                  // 로고가 없으면 간단한 이모지를 보여줍니다.
                  <span>{brand.emoji}</span>
                )}
              <span className={styles.brandName}>{brand.name}</span>
            </>
          )

          const button = (
            <button
              className={buttonClassName}
              onClick={() => handleBrandClick(brand.code, brand.comingSoon)}
              aria-pressed={isSelected}
              aria-label={`${brand.name} 필터${brand.comingSoon ? ' (곧 추가될 예정)' : ''}`}
              type="button"
              disabled={brand.comingSoon}
              aria-disabled={brand.comingSoon}
              title={brand.comingSoon ? '곧 추가될 예정이에요!' : undefined}
            >
              {buttonContent}
            </button>
          )

          const wrapperClass = brand.comingSoon ? styles.comingSoonWrapper : styles.buttonWrapper
          const bubbleClass = brand.bubblePosition === 'bottom'
            ? styles.comingSoonBubbleBottom
            : styles.comingSoonBubble

          return (
            <div key={brand.code} className={wrapperClass}>
              {button}
              {brand.comingSoon && (
                <span className={styles.comingSoonTooltip} role="status" aria-live="polite">
                  곧 추가될 예정이에요!
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BrandFilter
