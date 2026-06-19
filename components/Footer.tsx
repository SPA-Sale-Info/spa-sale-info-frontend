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
   * new Date(): 현재 날짜와 시간의 Date 객체를 생성합니다.
   * .getFullYear(): 4자리 연도(숫자)를 반환합니다.
   * 예: 2024, 2025, ...
   *
   * 왜 하드코딩(예: 2024) 대신 getFullYear()를 쓰나요?
   * 연도가 바뀌어도 코드를 수정할 필요가 없습니다.
   * 서버에서 렌더링 시 항상 최신 연도가 사용됩니다.
   * Java 비유: LocalDate.now().getYear()와 동일합니다.
   */
  const currentYear = new Date().getFullYear();

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

        {/* 소셜 미디어 섹션 (준비 중) */}
        <div className={styles.social}>
          <p className={styles.socialText}>소셜 미디어 준비 중입니다 🎉</p>
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
             * {currentYear}: JSX에서 중괄호 {}로 JavaScript 값을 표현합니다.
             * → currentYear 변수의 값(숫자)이 텍스트로 삽입됩니다.
             * → 예: '© 2025 ARCA. All rights reserved.'
             *
             * ©: 저작권 기호 (Copyright symbol)
             * HTML에서는 &copy;, JSX에서는 ©를 직접 쓸 수 있습니다.
             */}
            <p>© {currentYear} ARCA. All rights reserved.</p>
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
