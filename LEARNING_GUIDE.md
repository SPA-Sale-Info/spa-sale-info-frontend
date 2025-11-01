# 📚 학습 가이드 - JavaScript & React 핵심 개념

이 문서는 프로젝트에서 사용된 JavaScript와 React의 핵심 개념들을 정리한 학습 자료입니다.

## 목차

1. [JavaScript 기초](#1-javascript-기초)
2. [React 핵심 개념](#2-react-핵심-개념)
3. [Next.js 이해하기](#3-nextjs-이해하기)
4. [CSS 스타일링](#4-css-스타일링)
5. [실전 패턴](#5-실전-패턴)

---

## 1. JavaScript 기초

### 1.1 변수 선언 (const, let, var)

```javascript
// const: 재할당 불가 (상수)
const PI = 3.14
// PI = 3.15  // ❌ 에러!

// let: 재할당 가능
let count = 0
count = 1  // ✅ 가능

// var: 구식 문법 (사용 권장하지 않음)
var oldStyle = '오래된 방식'
```

**언제 뭘 쓰나요?**
- 기본적으로 `const` 사용
- 값이 변경되어야 하면 `let` 사용
- `var`는 사용하지 마세요

### 1.2 화살표 함수 (Arrow Function)

```javascript
// 일반 함수
function add(a, b) {
  return a + b
}

// 화살표 함수
const add = (a, b) => {
  return a + b
}

// 한 줄이면 return과 {} 생략 가능
const add = (a, b) => a + b

// 매개변수가 하나면 () 생략 가능
const double = x => x * 2
```

### 1.3 구조 분해 할당 (Destructuring)

```javascript
// 객체 구조 분해
const person = { name: '철수', age: 25 }
const { name, age } = person
console.log(name)  // '철수'

// 배열 구조 분해
const colors = ['red', 'green', 'blue']
const [first, second] = colors
console.log(first)  // 'red'

// React에서 자주 사용
function MyComponent({ title, description }) {
  // props.title, props.description 대신
  // 바로 title, description 사용 가능
}
```

### 1.4 스프레드 연산자 (Spread Operator)

```javascript
// 배열 복사
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]  // [1, 2, 3, 4, 5]

// 객체 복사
const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 }  // { a: 1, b: 2, c: 3 }

// Props 전달에 유용
<ProductCard {...product} />
// = <ProductCard name={product.name} price={product.price} ... />
```

### 1.5 템플릿 리터럴 (Template Literal)

```javascript
// 일반 문자열
const greeting = 'Hello, ' + name + '!'

// 템플릿 리터럴 (백틱 사용)
const greeting = `Hello, ${name}!`

// 여러 줄 문자열
const message = `
  첫 번째 줄
  두 번째 줄
  세 번째 줄
`

// 표현식 삽입
const price = 1000
const msg = `가격: ${price * 1.1}원` // '가격: 1100원'
```

### 1.6 배열 메서드

```javascript
const numbers = [1, 2, 3, 4, 5]

// map: 각 요소를 변환
const doubled = numbers.map(n => n * 2)  // [2, 4, 6, 8, 10]

// filter: 조건에 맞는 요소만
const evens = numbers.filter(n => n % 2 === 0)  // [2, 4]

// find: 첫 번째로 조건에 맞는 요소
const found = numbers.find(n => n > 3)  // 4

// forEach: 각 요소를 순회 (반환값 없음)
numbers.forEach(n => console.log(n))
```

### 1.7 비동기 처리 (async/await)

```javascript
// Promise 기본
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('데이터')
    }, 1000)
  })
}

// async/await로 Promise 사용
async function getData() {
  try {
    const data = await fetchData()  // 1초 대기
    console.log(data)  // '데이터'
  } catch (error) {
    console.error(error)
  }
}
```

---

## 2. React 핵심 개념

### 2.1 컴포넌트 (Component)

```javascript
// 함수형 컴포넌트
function Welcome({ name }) {
  return <h1>안녕하세요, {name}님!</h1>
}

// 사용
<Welcome name="철수" />
```

**컴포넌트란?**
- UI의 독립적이고 재사용 가능한 조각
- 레고 블록처럼 조합하여 화면 구성

### 2.2 Props (속성)

```javascript
// 부모 컴포넌트
function App() {
  return <Greeting name="철수" age={25} />
}

// 자식 컴포넌트
function Greeting({ name, age }) {
  return <p>{name}님은 {age}세입니다.</p>
}
```

**Props의 특징:**
- 부모 → 자식으로 데이터 전달
- 읽기 전용 (자식이 수정 불가)
- 함수도 전달 가능

### 2.3 State (상태)

```javascript
import { useState } from 'react'

function Counter() {
  // [현재값, 변경함수] = useState(초기값)
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  )
}
```

**State vs Props:**
- State: 컴포넌트 내부 데이터 (변경 가능)
- Props: 외부에서 받은 데이터 (읽기 전용)

### 2.4 useEffect 훅

```javascript
import { useEffect, useState } from 'react'

function DataLoader() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 컴포넌트가 렌더링된 후 실행
    fetchData().then(setData)

    // Cleanup 함수 (선택사항)
    return () => {
      // 컴포넌트가 사라질 때 실행
      console.log('정리 작업')
    }
  }, [])  // 빈 배열: 처음 한 번만 실행

  return <div>{data}</div>
}
```

**의존성 배열:**
```javascript
useEffect(() => {
  // code
}, [])           // 마운트 시 한 번만

useEffect(() => {
  // code
}, [count])      // count가 변경될 때마다

useEffect(() => {
  // code
})              // 매 렌더링마다 (거의 사용 안 함)
```

### 2.5 조건부 렌더링

```javascript
function Greeting({ isLoggedIn, username }) {
  // if-else 방식
  if (isLoggedIn) {
    return <h1>환영합니다, {username}님!</h1>
  } else {
    return <h1>로그인해주세요</h1>
  }

  // 삼항 연산자
  return (
    <h1>
      {isLoggedIn ? `환영합니다, ${username}님!` : '로그인해주세요'}
    </h1>
  )

  // && 연산자
  return (
    <div>
      {isLoggedIn && <p>로그인됨</p>}
    </div>
  )
}
```

### 2.6 리스트 렌더링

```javascript
function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}  // ⚠️ key는 필수!
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  )
}
```

**key의 중요성:**
- React가 어떤 항목이 변경되었는지 식별
- 고유한 값이어야 함 (보통 id 사용)
- 배열 인덱스를 key로 쓰면 안 되는 이유: 순서가 바뀌면 문제 발생

---

## 3. Next.js 이해하기

### 3.1 파일 기반 라우팅

```
pages/
  index.js         → /
  about.js         → /about
  blog/
    index.js       → /blog
    [id].js        → /blog/123 (동적 라우팅)
  products/
    [brand].js     → /products/zara
```

### 3.2 특수 파일들

```javascript
// _app.js - 모든 페이지의 공통 레이아웃
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

// _document.js - HTML 문서 구조
function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

### 3.3 Image 최적화

```javascript
import Image from 'next/image'

// ✅ Next.js Image (권장)
<Image
  src="/product.jpg"
  alt="상품 이미지"
  width={300}
  height={400}
/>

// ❌ 일반 img 태그 (비권장)
<img src="/product.jpg" alt="상품 이미지" />
```

**Next.js Image의 장점:**
- 자동 이미지 최적화 (WebP 변환)
- Lazy loading (스크롤할 때만 로드)
- 레이아웃 시프트 방지
- 성능 향상

---

## 4. CSS 스타일링

### 4.1 CSS Modules

```javascript
// styles/Button.module.css
.button {
  background: blue;
  color: white;
}

// components/Button.js
import styles from './Button.module.css'

function Button() {
  return <button className={styles.button}>클릭</button>
}
```

**CSS Modules의 장점:**
- 클래스명 충돌 방지
- 컴포넌트 단위 스타일 관리
- 자동으로 고유한 클래스명 생성

### 4.2 동적 클래스명

```javascript
// 템플릿 리터럴 사용
<button className={`${styles.button} ${isActive ? styles.active : ''}`}>

// 조건부 클래스
<div className={`${styles.card} ${error && styles.error}`}>
```

### 4.3 반응형 디자인

```css
/* 모바일 퍼스트 */
.container {
  width: 100%;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

/* 데스크톱 이상 */
@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}
```

---

## 5. 실전 패턴

### 5.1 상태 끌어올리기 (Lifting State Up)

```javascript
// ❌ 잘못된 방법 - 각 컴포넌트가 독립적인 상태 유지
function App() {
  return (
    <>
      <FilterA />  {/* 독립적인 filter 상태 */}
      <FilterB />  {/* 독립적인 filter 상태 */}
    </>
  )
}

// ✅ 올바른 방법 - 부모가 상태 관리
function App() {
  const [filter, setFilter] = useState('all')

  return (
    <>
      <FilterA filter={filter} onChange={setFilter} />
      <FilterB filter={filter} onChange={setFilter} />
    </>
  )
}
```

### 5.2 API 호출 패턴

```javascript
function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await api.getProducts()
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error}</div>

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} {...p} />)}
    </div>
  )
}
```

### 5.3 에러 처리

```javascript
try {
  const response = await fetch('/api/data')

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  return data

} catch (error) {
  console.error('에러 발생:', error)
  // 사용자에게 에러 표시
  // 에러 로깅 서비스에 전송
  throw error
}
```

---

## 📖 더 학습하기

### 추천 자료

**JavaScript:**
- [MDN JavaScript 가이드](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide)
- [모던 JavaScript 튜토리얼](https://ko.javascript.info/)

**React:**
- [React 공식 문서 (한글)](https://ko.react.dev/)
- [React Tutorial](https://react.dev/learn)

**Next.js:**
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Next.js 한글 가이드](https://nextjs.org/learn)

**CSS:**
- [CSS Tricks](https://css-tricks.com/)
- [Flexbox Froggy](https://flexboxfroggy.com/) (게임으로 배우기)
- [Grid Garden](https://cssgridgarden.com/) (게임으로 배우기)

---

## 💡 학습 팁

1. **코드를 직접 수정해보세요**
   - 주석을 읽고 코드를 변경해보며 어떻게 작동하는지 확인

2. **에러를 두려워하지 마세요**
   - 에러 메시지를 읽고 이해하려 노력
   - 에러는 배움의 기회!

3. **작은 단위로 나눠서 학습**
   - 한 번에 모든 것을 이해하려 하지 말고
   - 하나의 개념씩 천천히

4. **실제로 만들어보세요**
   - 이 프로젝트를 기반으로 자신만의 기능 추가
   - 다른 프로젝트도 만들어보기

5. **커뮤니티 활용**
   - Stack Overflow
   - React 한국 사용자 그룹
   - 각종 개발 커뮤니티

---

행운을 빕니다! 🚀
