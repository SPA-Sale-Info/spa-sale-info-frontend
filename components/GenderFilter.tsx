/**
 * GenderFilter.tsx - 성별 필터 컴포넌트 (TypeScript 버전)
 */

import styles from '../styles/GenderFilter.module.css';
import type { Gender } from '../types';

interface GenderItem {
  code: Gender | 'all';
  name: string;
}

interface GenderFilterProps {
  selectedGender: Gender | 'all';
  onGenderChange: (genderCode: Gender | 'all') => void;
}

const GENDERS: GenderItem[] = [
  { code: 'all', name: '전체' },
  { code: 'WOMAN', name: '여성' },
  { code: 'MAN', name: '남성' },
];

function GenderFilter({ selectedGender, onGenderChange }: GenderFilterProps) {
  const handleGenderClick = (genderCode: Gender | 'all') => {
    onGenderChange(genderCode);
  };

  return (
    <div className={styles.container} role="radiogroup" aria-label="성별 필터">
      {GENDERS.map((gender) => {
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
