/**
 * GenderFilter.tsx - 성별 필터 컴포넌트 (TypeScript 버전)
 *
 * 성별 버튼을 렌더링하고 선택 상태를 부모에게 전달합니다.
 * v4 변경사항: 슬라이딩 인디케이터 추가
 * - useRef: 컨테이너 DOM 참조
 * - useState: 인디케이터의 left/width/ready 상태
 * - useLayoutEffect: 선택된 버튼의 DOM 위치를 읽어 인디케이터를 이동시킵니다.
 *   (useEffect 대신 useLayoutEffect를 쓰는 이유: DOM 업데이트 직후, 브라우저 페인트 전에 실행되어
 *    위치값을 정확히 읽을 수 있습니다.)
 */

import { useRef, useState, useLayoutEffect } from 'react';
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
  // containerRef: 컨테이너 DOM 요소를 참조합니다. offsetLeft 계산에 필요합니다.
  const containerRef = useRef<HTMLDivElement>(null);
  // indicator: 슬라이딩 바의 위치(left), 너비(width), 초기화 완료 여부(ready)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  /**
   * selectedGender가 바뀔 때마다 선택된 버튼의 DOM 위치를 읽어 인디케이터를 이동시킵니다.
   * useLayoutEffect: 브라우저 페인트 전에 실행되므로 깜빡임 없이 위치를 계산합니다.
   * indicator.ready가 false이면 transition 없이 즉시 이동해 초기 위치를 잡습니다.
   */
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const btn = containerRef.current.querySelector('[aria-pressed="true"]') as HTMLElement | null;
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true });
  }, [selectedGender]);

  return (
    <div className={styles.container} ref={containerRef} role="radiogroup" aria-label="성별 필터">
      {/* 슬라이딩 인디케이터 — 선택된 버튼 위에 겹쳐져 spring 애니메이션으로 이동합니다.
          ready가 false일 때는 transition 없이 초기 위치에서 시작합니다.
          opacity 0으로 시작하여 깜빡임을 방지합니다. */}
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
      {GENDERS.map((gender) => {
        // 선택된 항목인지 확인
        const isSelected = selectedGender === gender.code;
        const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`;

        return (
          <button
            key={gender.code}
            className={buttonClassName}
            onClick={() => onGenderChange(gender.code)}
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
