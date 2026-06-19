/**
 * ThemeToggle.tsx - 다크/라이트 테마 전환 버튼 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 화면 오른쪽 상단에 있는 "해/달" 아이콘 버튼입니다.
 * 클릭하면 전체 앱의 색상 테마가 밝음(light) ↔ 어두움(dark)으로 바뀝니다.
 * 사용자의 선택은 localStorage에 저장되어 새로고침 후에도 유지됩니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 📚 사용 라이브러리: next-themes
 * ═══════════════════════════════════════════════════════════════
 * next-themes는 Next.js 전용 테마 관리 라이브러리입니다.
 * - useTheme() 훅으로 현재 테마와 변경 함수를 한 번에 가져올 수 있습니다.
 * - _app.tsx의 <ThemeProvider attribute="data-theme"> 안에서만 동작합니다.
 * - HTML의 <html> 태그에 data-theme="dark" 또는 data-theme="light" 속성을 추가합니다.
 * - globals.css에서 [data-theme="dark"] 선택자로 색상 변수를 덮어써서 테마를 구현합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ SSR(서버사이드 렌더링)과 Hydration 문제
 * ═══════════════════════════════════════════════════════════════
 * Next.js 동작 순서:
 * 1. 서버에서 HTML을 미리 만들어 브라우저에 전송 (SSR)
 * 2. 브라우저가 HTML을 받아 표시
 * 3. React가 클라이언트에서 이어받아 이벤트 연결 (Hydration)
 *
 * 문제: 서버는 사용자 PC의 localStorage(테마 설정)를 읽을 수 없습니다.
 *   → 서버: theme = undefined (모름)
 *   → 클라이언트: theme = 'dark' (localStorage에서 읽음)
 *   → 서버와 클라이언트 결과가 다르면 "Hydration mismatch" 콘솔 오류가 발생합니다.
 *
 * 해결책: mounted 상태가 false(= 서버 단계)일 때는 null을 반환해서
 * 컴포넌트 자체를 렌더하지 않습니다.
 * mounted가 true가 되는 시점 = 클라이언트에서 React가 실행된 후.
 */

// useState: 컴포넌트 내부에서 변하는 값(상태)을 관리하는 React 훅
// useEffect: 컴포넌트가 화면에 나타난 후 실행할 코드를 등록하는 React 훅
import { useState, useEffect } from 'react';

// next-themes 라이브러리에서 useTheme 훅을 가져옵니다.
// useTheme(): 현재 테마(theme)와 테마 변경 함수(setTheme)를 반환합니다.
import { useTheme } from 'next-themes';

// CSS 모듈: 이 컴포넌트에서만 사용하는 스타일 파일입니다.
// styles.toggleButton처럼 점(.) 표기법으로 클래스명을 참조합니다.
// CSS 모듈은 클래스명 충돌을 방지하기 위해 자동으로 고유한 이름을 생성합니다.
// 예: styles.icon → "_ThemeToggle_icon__3kA9f" 같은 고유 클래스명
import styles from '../styles/ThemeToggle.module.css';

/**
 * ThemeToggle 컴포넌트
 *
 * 함수형 컴포넌트(Functional Component)입니다.
 * props를 받지 않는 가장 단순한 형태입니다.
 *
 * export default: 이 파일에서 "기본으로 내보내는" 컴포넌트를 지정합니다.
 * 다른 파일에서 import ThemeToggle from './ThemeToggle' 처럼 가져다 씁니다.
 *
 * Java/Spring 비유: @Component 어노테이션이 붙은 Bean과 비슷합니다.
 */
export default function ThemeToggle() {
  /**
   * useState<boolean>(false)
   * ─────────────────────────────────────────────────────────
   * mounted: 컴포넌트가 브라우저 DOM에 "마운트(등장)"되었는지 나타내는 상태값
   * - 초기값: false (아직 서버 단계 또는 렌더 직전)
   * - 나중에 true로 변경하면 React가 자동으로 화면을 다시 그립니다.
   *
   * useState 반환값 구조:
   * const [현재값, 변경함수] = useState(초기값)
   *   - mounted: 현재 상태 값 (boolean)
   *   - setMounted: 상태를 바꾸는 함수 (호출하면 컴포넌트가 리렌더됩니다)
   *
   * Java/Spring 비유: private boolean mounted = false;
   * setMounted(true) ≈ this.mounted = true; (단, React가 화면 업데이트를 자동으로 처리)
   */
  const [mounted, setMounted] = useState(false);

  /**
   * useTheme()
   * ─────────────────────────────────────────────────────────
   * next-themes가 제공하는 훅(Hook)입니다.
   * - theme: 현재 적용된 테마 문자열 ('dark' | 'light' | 'system' | undefined)
   * - setTheme: 테마를 변경하는 함수. setTheme('dark') 처럼 호출합니다.
   *
   * 구조 분해 할당(Destructuring):
   * const { theme, setTheme } = useTheme();
   * → useTheme()이 반환한 객체에서 theme와 setTheme를 꺼내 씁니다.
   * Java 비유: Theme t = themeService.getTheme(); String theme = t.getName();
   */
  const { theme, setTheme } = useTheme();

  /**
   * useEffect(() => { 실행할코드 }, [의존성배열])
   * ─────────────────────────────────────────────────────────
   * 컴포넌트가 화면에 나타난 후 "부수 효과(side effect)"를 처리합니다.
   * 두 번째 인자가 빈 배열([])이면 → 컴포넌트가 처음 등장할 때 딱 한 번만 실행됩니다.
   *
   * 왜 useEffect 안에서만 mounted를 true로 바꾸나요?
   * useEffect는 클라이언트(브라우저)에서만 실행됩니다.
   * → setMounted(true)가 실행된다는 것 = 지금 클라이언트에서 렌더 중 = 테마 안전하게 읽을 수 있음
   *
   * Java 비유: @PostConstruct (빈 생성 직후 한 번 실행)
   * void initialize() { this.mounted = true; }
   */
  useEffect(() => {
    setMounted(true);
    // 의존성 배열이 []이므로 이 effect는 마운트 시 딱 한 번만 실행됩니다.
  }, []);

  /**
   * Early return 패턴 — SSR 보호
   * ─────────────────────────────────────────────────────────
   * mounted가 false이면 (= 아직 서버 렌더 단계이거나 클라이언트 초기화 전)
   * null을 반환하여 아무것도 렌더하지 않습니다.
   *
   * null 반환 = React에서 "화면에 아무것도 그리지 마세요"
   * → 서버와 클라이언트의 HTML이 일치하여 Hydration 오류가 발생하지 않습니다.
   */
  if (!mounted) {
    return null;
  }

  /**
   * 버튼 렌더링 — 클라이언트에서만 도달하는 코드
   * ─────────────────────────────────────────────────────────
   * JSX(JavaScript XML): HTML과 유사한 문법으로 UI를 선언합니다.
   * 실제로는 React.createElement() 함수 호출로 변환됩니다.
   *
   * <button
   *   onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
   * >
   * - onClick: 클릭 이벤트 리스너입니다. 브라우저의 addEventListener('click', ...)와 같습니다.
   * - () => ...: 화살표 함수(Arrow Function). 클릭 시 실행됩니다.
   * - theme === 'dark' ? 'light' : 'dark': 삼항 연산자
   *   현재 테마가 'dark'이면 'light'로, 아니면 'dark'로 전환합니다.
   *
   * aria-label: 접근성(Accessibility) 속성입니다.
   * 스크린 리더(시각 장애인용 도구)가 버튼의 용도를 읽어줄 때 사용합니다.
   * 아이콘만 있는 버튼에는 반드시 aria-label을 달아야 합니다.
   *
   * type="button": <button>의 기본 type은 "submit"입니다.
   * <form> 안에 있으면 의도치 않게 폼이 제출될 수 있으므로 "button"을 명시합니다.
   */
  return (
    <button
      className={styles.toggleButton}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      type="button"
    >
      {/**
       * 삼항 연산자로 테마에 맞는 아이콘 선택
       * theme === 'dark' → 해 아이콘(☀) 표시 (다크 모드 → 라이트 모드로 전환 예고)
       * theme !== 'dark' → 달 아이콘(🌙) 표시 (라이트 모드 → 다크 모드로 전환 예고)
       */}
      {theme === 'dark' ? (
        /**
         * SVG(Scalable Vector Graphics) — 해 아이콘
         * ─────────────────────────────────────────────────────
         * SVG는 수학적 공식으로 그린 벡터 이미지입니다.
         * 픽셀 기반(PNG, JPG)과 달리 어떤 크기에서도 선명합니다.
         *
         * 주요 속성:
         * - viewBox="0 0 24 24": 24×24 좌표계 기준으로 그립니다.
         * - fill="none": 도형 내부를 채우지 않습니다 (선만 표시).
         * - stroke="currentColor": CSS color 속성 값을 선 색상으로 씁니다.
         *   → 다크/라이트 모드에서 자동으로 색상이 바뀝니다.
         * - strokeWidth="2": 선 두께 2
         * - strokeLinecap/strokeLinejoin="round": 선 끝과 꺾임을 둥글게 처리
         */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          {/* <circle>: 원형 — 해의 중심 */}
          <circle cx="12" cy="12" r="5" />
          {/* <line>: 직선 — 해의 빛줄기 8개 (상하좌우 + 대각선 4개) */}
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /**
         * SVG — 달 아이콘 (라이트 모드일 때 표시)
         *
         * <path d="...">: SVG 경로 명령어로 복잡한 도형을 그립니다.
         * "M21 12.79A9 9 ..." — 달 모양을 좌표로 표현한 경로 데이터입니다.
         * M = Move(이동), A = Arc(호 그리기), Z = Close(닫기)
         */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
