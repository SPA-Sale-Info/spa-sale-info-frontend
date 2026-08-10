/**
 * Footer.tsx - 사이트 하단 푸터 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 사이트 하단(footer)에 표시되는 공통 영역입니다.
 * 모든 페이지에서 동일하게 표시됩니다 (pages/_app.tsx에서 글로벌로 렌더링).
 *
 * 표시 내용:
 * - 브랜드 섹션 (서비스명, 소개)
 * - 서비스 링크 (세일 상품, 즐겨찾기)
 * - 정보 링크 (문의하기)
 * - 약관 링크 (개인정보처리방침, 이용약관)
 * - 소셜 미디어 안내
 * - 운영/문의/호스팅 정보
 * - 저작권 표시 (현재 연도 자동 계산)
 * - 면책 조항
 *
 * ═══════════════════════════════════════════════════════════════
 * 왜 푸터가 필요한가요?
 * ═══════════════════════════════════════════════════════════════
 * 1. 법적 요구사항: 개인정보처리방침, 이용약관은 서비스 운영 시 필수입니다.
 * 2. Google AdSense 승인: 광고 승인에 필요한 페이지 완성도를 높입니다.
 * 3. SEO: 내부 링크 구조를 만들어 검색 엔진 크롤링을 돕습니다.
 * 4. 사용자 경험: 문의처, 회사 정보 등을 하단에서 쉽게 찾을 수 있습니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - 함수형 컴포넌트 (function Footer()): props가 없어서 매개변수가 없습니다.
 * - new Date().getFullYear(): 현재 연도를 숫자로 반환합니다.
 * - {' '}: JSX에서 명시적 공백 문자 (HTML에서 &nbsp;와 비슷한 역할)
 * - <a href="mailto:...">: 이메일 링크 (클릭 시 메일 클라이언트가 열림)
 * - {currentYear}: JSX에서 중괄호로 JavaScript 값을 표현합니다.
 */

// Link: Next.js 클라이언트 사이드 네비게이션 컴포넌트
// 클릭 시 전체 페이지를 다시 불러오지 않고 URL만 변경합니다 (SPA 방식).
// → 빠른 페이지 전환, 현재 스크롤 위치 유지 등의 장점이 있습니다.
import Link from 'next/link';

// useState: 컴포넌트가 기억해야 하는 값(여기서는 현재 연도)을 담는 React 훅
// useEffect: 렌더가 끝난 뒤(=브라우저에서만) 실행할 코드를 등록하는 React 훅
// → 아래 currentYear 주석에 설명한 hydration 문제를 피하기 위해 둘 다 필요합니다.
import { useEffect, useState } from 'react';

// 이 컴포넌트 전용 CSS 모듈
import styles from '../styles/Footer.module.css';

/**
 * Footer 컴포넌트
 *
 * props 없음: 이 컴포넌트는 외부에서 데이터를 받지 않고 자체적으로 콘텐츠를 결정합니다.
 * → "상태 없는(Stateless) 프레젠테이션 컴포넌트"입니다.
 * → 같은 결과를 항상 렌더링합니다 (currentYear 제외).
 *
 * export default: 기본 내보내기
 * pages/_app.tsx에서 import Footer from './Footer'로 가져와 모든 페이지에 적용합니다.
 */
export default function Footer() {
  /**
   * currentYear - 현재 연도 (저작권 표시에 사용)
   *
   * ⚠️ 예전에는 이 자리에서 바로 `new Date().getFullYear()`를 호출했습니다.
   * 하지만 그 코드는 "렌더 중"에 실행되기 때문에 서버와 브라우저가 서로 다른 값을
   * 만들 수 있고, 그러면 React가 hydration 중 텍스트 불일치(#425)를 던집니다.
   *
   * 푸터는 _app.tsx를 통해 모든 페이지에 들어가는데, 이 페이지들은 빌드 시점에
   * HTML이 미리 만들어집니다(SSG). 즉 서버 HTML에는 **빌드한 해**가 박제되고,
   * 브라우저는 **접속한 해**를 계산합니다. 평소에는 두 값이 같아 문제가 없다가,
   * 해가 바뀌는 순간(재배포 전 1월 1일) 모든 페이지에서 에러가 터지는 지뢰였습니다.
   *
   * 해결책은 pages/index.tsx의 todayKey와 같은 "2단계 렌더" 패턴입니다.
   * - 첫 렌더(서버 HTML + hydration 시점): null → 연도를 아예 그리지 않습니다.
   *   → 서버와 브라우저의 출력이 동일해지므로 불일치가 발생할 수 없습니다.
   * - 마운트 이후 useEffect: 브라우저의 진짜 현재 연도로 채웁니다.
   *   useEffect는 hydration이 끝난 뒤에만 실행되므로 안전합니다.
   *
   * Java 비유: LocalDate.now().getYear()를 템플릿 캐시를 만드는 시점이 아니라
   * 응답을 내보낸 뒤에 채워 넣는 것과 같습니다.
   */
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  /**
   * JSX 반환 — 푸터 UI
   *
   * <footer>: HTML5 시맨틱 요소 — 사이트 하단 영역을 의미합니다.
   *   <header>가 상단이면, <footer>는 하단입니다.
   *   스크린 리더와 검색 엔진이 이 영역을 하단 정보로 인식합니다.
   *
   * className={styles.footer}: CSS 모듈 클래스 적용
   *   빌드 시 'Footer_footer__xxxx'와 같이 고유한 클래스명으로 변환됩니다.
   *   다른 컴포넌트의 .footer 클래스와 충돌하지 않습니다.
   */
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 메인 푸터 콘텐츠 — 4개의 섹션으로 구성됩니다 */}
        <div className={styles.main}>
          {/* 브랜드 섹션 — 서비스명과 한 줄 소개 */}
          <div className={styles.section}>
            {/**
             * <h3>: 3단계 제목
             * 페이지 구조: h1(페이지 제목) > h2(주요 섹션) > h3(하위 섹션)
             * 검색 엔진은 h태그 계층 구조를 분석합니다.
             */}
            <h3 className={styles.brand}>ARCA</h3>
            <p className={styles.description}>
              합리적인 가격으로 즐기는
              {/**
               * <br />: 줄 바꿈 태그 (브라우저가 자동 줄 바꿈하지 않을 때 강제 줄 바꿈)
               * JSX에서 self-closing 태그는 반드시 /로 닫아야 합니다 (<br />).
               * HTML의 <br>과 동일하지만 JSX 규칙상 슬래시가 필요합니다.
               */}
              <br />
              프리미엄 스타일 큐레이션
            </p>
          </div>

          {/* 서비스 링크 섹션 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>서비스</h4>
            {/**
             * <nav>: 네비게이션 링크 그룹을 의미하는 시맨틱 요소
             * 스크린 리더가 이 영역을 "탐색 메뉴"로 인식합니다.
             */}
            <nav className={styles.nav}>
              {/**
               * Link 컴포넌트: Next.js 내부 링크 (SPA 방식 네비게이션)
               * href="/": 루트 경로 → 메인 페이지(pages/index.tsx)로 이동
               * href="/favorites": 즐겨찾기 페이지(pages/favorites.tsx)로 이동
               *
               * 일반 <a href="/">와 달리, Link는 전체 페이지를 다시 불러오지 않고
               * JavaScript로 URL과 컴포넌트만 교체합니다 (더 빠름).
               */}
              <Link href="/" className={styles.link}>
                세일 상품
              </Link>
              <Link href="/favorites" className={styles.link}>
                즐겨찾기
              </Link>
            </nav>
          </div>

          {/* 정보 링크 섹션 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>정보</h4>
            <nav className={styles.nav}>
              <Link href="/contact" className={styles.link}>
                문의하기
              </Link>
            </nav>
          </div>

          {/* 약관 링크 섹션 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>약관</h4>
            <nav className={styles.nav}>
              <Link href="/privacy" className={styles.link}>
                개인정보처리방침
              </Link>
              <Link href="/terms" className={styles.link}>
                이용약관
              </Link>
            </nav>
          </div>
        </div>

        {/* 하단 정보 영역 — 운영자 정보, 저작권, 면책 조항 */}
        <div className={styles.bottom}>
          <div className={styles.info}>
            {/**
             * <strong>: 중요한 텍스트를 강조합니다 (굵게 표시).
             * <b>태그와 비슷하지만, <strong>은 의미론적으로 "중요함"을 나타냅니다.
             * 스크린 리더가 강세를 주어 읽을 수 있습니다.
             */}
            <p className={styles.infoText}>
              <strong>운영</strong>: 개인 프로젝트
            </p>
            <p className={styles.infoText}>
              <strong>문의</strong>:{' '}
              {/**
               * {' '}: JSX에서 명시적 공백 문자
               * JSX는 연속된 공백을 하나로 합치므로, 명시적으로 공백이 필요할 때 사용합니다.
               * HTML의 &nbsp;(non-breaking space)와 유사한 역할입니다.
               *
               * <a href="mailto:...">: 이메일 링크
               * mailto: 프로토콜은 클릭 시 기본 메일 클라이언트(Gmail, 메일앱 등)를 엽니다.
               * Next.js Link 대신 일반 <a>를 쓰는 이유: mailto는 외부 링크이기 때문입니다.
               * Next.js Link는 내부 페이지 이동에만 사용합니다.
               */}
              <a href="mailto:support@salearchive.com" className={styles.emailLink}>
                support@salearchive.com
              </a>
            </p>
            <p className={styles.infoText}>
              <strong>호스팅</strong>: Vercel
            </p>
          </div>

          {/* 저작권 표시 */}
          <div className={styles.copyright}>
            {/**
             * {...}: JSX에서 중괄호로 JavaScript 값을 표현합니다.
             *
             * currentYear는 마운트 전에는 null이므로 삼항 연산자로 두 문구를 나눕니다.
             * - 첫 렌더(서버 HTML == 브라우저 첫 렌더): '© ARCA.'  ← 양쪽이 완전히 같은 문자열
             * - 마운트 이후                            : '© 2026 ARCA.'
             * 이렇게 문자열 전체를 한 번에 만들면 연도가 없을 때 공백이 두 칸 생기는 것도 막힙니다.
             *
             * ©: 저작권 기호 (Copyright symbol)
             * HTML에서는 &copy;, JSX에서는 ©를 직접 쓸 수 있습니다.
             */}
            {/* Framer 시안 카피: 저작권 + 가격 정보 기준 안내를 한 줄로 */}
            <p>
              {currentYear === null ? '© ARCA.' : `© ${currentYear} ARCA.`} 모든 가격 정보는 각
              브랜드 공식몰 기준입니다.
            </p>
          </div>

          {/* 면책 조항 (Disclaimer) */}
          <div className={styles.disclaimer}>
            <p>
              본 서비스는 정보 제공 목적으로 운영되며, 실제 구매는 각 브랜드 공식 사이트에서 이루어집니다. 상품
              정보는 실시간으로 업데이트되지만, 최종 가격과 재고는 공식 사이트를 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
