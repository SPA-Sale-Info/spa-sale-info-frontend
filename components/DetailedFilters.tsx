import styles from '../styles/DetailedFilters.module.css';

/**
 * DetailedFilters.tsx - 할인율 / 가격대 상세 필터 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * "할인율 N% 이상", "가격 N원 이하" 같은 세부 조건으로 상품을 좁혀줍니다.
 * 할인 정보 서비스의 핵심 필터이므로(싼 것/많이 깎인 것 찾기) UI를 활성화합니다.
 *
 * 상태는 부모(index.tsx)가 소유하고(Lifting State Up), 이 컴포넌트는
 * 현재 선택값(selectedDiscount/selectedPrice)과 변경 콜백만 props로 받습니다.
 */

// 할인율 옵션 — value는 "이 값 이상"을 의미하는 최소 할인율(%)입니다.
const DISCOUNT_OPTIONS = [
  { label: '30% 이상', value: 30 },
  { label: '50% 이상', value: 50 },
  { label: '70% 이상', value: 70 },
];

// 가격대 옵션 — value는 "이 값 이하"를 의미하는 최대 가격(원)입니다.
const PRICE_OPTIONS = [
  { label: '3만원 이하', value: 30000 },
  { label: '5만원 이하', value: 50000 },
  { label: '10만원 이하', value: 100000 },
];

// 상세 필터에서 사용할 props 타입
interface DetailedFiltersProps {
  selectedDiscount: number;                    // 현재 선택된 최소 할인율 (0 = 전체)
  onDiscountChange: (discount: number) => void; // 할인율 변경 콜백
  selectedPrice: number;                        // 현재 선택된 최대 가격 (Infinity = 전체)
  onPriceChange: (price: number) => void;       // 가격 변경 콜백
}

/**
 * 상세 필터 컴포넌트
 */
export default function DetailedFilters({
  selectedDiscount,
  onDiscountChange,
  selectedPrice,
  onPriceChange,
}: DetailedFiltersProps) {
  return (
    <div className={styles.container}>
      {/* 할인율 필터 그룹 */}
      <div className={styles.group}>
        <span className={styles.label}>할인율</span>
        <div className={styles.options}>
          {/* '전체' = 최소 할인율 0 (제한 없음) */}
          <button
            type="button"
            className={`${styles.chip} ${selectedDiscount === 0 ? styles.active : ''}`}
            onClick={() => onDiscountChange(0)}
            aria-pressed={selectedDiscount === 0}
          >
            전체
          </button>
          {DISCOUNT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`${styles.chip} ${selectedDiscount === option.value ? styles.active : ''}`}
              onClick={() => onDiscountChange(option.value)}
              aria-pressed={selectedDiscount === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 가격대 필터 그룹 */}
      <div className={styles.group}>
        <span className={styles.label}>가격대</span>
        <div className={styles.options}>
          {/* '전체' = 최대 가격 Infinity (제한 없음) */}
          <button
            type="button"
            className={`${styles.chip} ${selectedPrice === Infinity ? styles.active : ''}`}
            onClick={() => onPriceChange(Infinity)}
            aria-pressed={selectedPrice === Infinity}
          >
            전체
          </button>
          {PRICE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`${styles.chip} ${selectedPrice === option.value ? styles.active : ''}`}
              onClick={() => onPriceChange(option.value)}
              aria-pressed={selectedPrice === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
