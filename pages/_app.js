/**
 * _app.js - Next.js의 최상위 컴포넌트
 *
 * 이 파일은 모든 페이지에서 공통으로 사용되는 설정을 관리합니다.
 *
 * 왜 필요한가요?
 * - 모든 페이지에 공통으로 적용될 레이아웃이나 스타일을 설정
 * - 전역 상태 관리 (Context API, Redux 등)를 설정
 * - 페이지 전환 시 유지되어야 하는 상태를 관리
 *
 * 주요 개념:
 * - Component: 현재 보여질 페이지 컴포넌트
 * - pageProps: 페이지에 전달될 데이터 (props)
 */

// 전역 스타일을 import 합니다
// '../styles/globals.css' 파일의 스타일이 모든 페이지에 적용됩니다
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'

/**
 * MyApp 컴포넌트
 *
 * @param {Object} props - 컴포넌트에 전달되는 속성
 * @param {React.Component} props.Component - 현재 페이지 컴포넌트
 * @param {Object} props.pageProps - 페이지에 전달될 데이터
 * @returns {JSX.Element} 렌더링될 컴포넌트
 */
function MyApp({ Component, pageProps }) {
  /**
   * JSX 문법 설명:
   * - <Component {...pageProps} />는 현재 페이지 컴포넌트를 렌더링합니다
   * - {...pageProps}는 스프레드 연산자로, pageProps의 모든 속성을 Component에 전달합니다
   *
   * 예시:
   * pageProps = { title: "홈", data: [...] }
   * -> <Component title="홈" data={[...]} />와 같습니다
   */
  return (
    <ThemeProvider attribute="data-theme">
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

/**
 * export default란?
 * - 이 파일의 기본(default) export를 정의합니다
 * - 다른 파일에서 import MyApp from './_app'로 불러올 수 있습니다
 * - default export는 파일당 하나만 가능합니다
 */
export default MyApp
