/**
 * GenderFilter.tsx - 성별 필터 컴포넌트 (TypeScript 버전)
 *
 * 성별 버튼을 렌더링하고 선택 상태를 부모에게 전달합니다.
 * TypeScript 문법 포인트:
 * - `Gender | 'all'` 유니온 타입으로 "전체" 선택을 표현합니다.
 */

import styles from '../styles/GenderFilter.module.css';
import type { Gender } from '../types';

// 성별 버튼 한 개가 가져야 할 데이터 구조
interface GenderItem {
  code: Gender | 'all';
  name: string;
}

// 컴포넌트에 전달되는 props 타입
interface GenderFilterProps {
  selectedGender: Gender | 'all';
  onGenderChange: (genderCode: Gender | 'all') => void;
}

// 화면에 표시할 성별 목록
const GENDERS: GenderItem[] = [
  { code: 'all', name: '전체' },
  { code: 'WOMAN', name: '여성' },
  { code: 'MAN', name: '남성' },
];

function GenderFilter({ selectedGender, onGenderChange }: GenderFilterProps) {
  // 클릭된 성별을 부모로 전달
  const handleGenderClick = (genderCode: Gender | 'all') => {
    onGenderChange(genderCode);
  };

  return (
    <div className={styles.container} role="radiogroup" aria-label="성별 필터">
      {GENDERS.map((gender) => {
        // 선택된 항목인지 확인
        const isSelected = selectedGender === gender.code;
        const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`;

        return (
          <button
            key={gender.code}
            className={buttonClassName}
            onClick={() => handleGenderClick(gender.code)}
            aria-pressed={isSelected}
            aria-label={`${gender.name} 상품만 보기`}
            type="button"
          >
            <span>{gender.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default GenderFilter;
