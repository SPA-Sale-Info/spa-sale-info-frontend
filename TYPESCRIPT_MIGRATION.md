# TypeScript 마이그레이션 가이드

## 📋 개요

이 문서는 SPA Sale Info Frontend 프로젝트를 JavaScript에서 TypeScript로 마이그레이션하는 방법을 안내합니다.

## ✅ 완료된 작업

### 1. TypeScript 설치 및 설정
- ✅ TypeScript 및 타입 정의 패키지 설치
- ✅ `tsconfig.json` 설정 파일 생성
- ✅ `next-env.d.ts` 파일 생성

### 2. 타입 정의 생성
- ✅ `/types/index.ts` - 공통 타입 정의
  - Product, Brand, Gender, Category 등 핵심 타입
  - API 요청/응답 타입
  - 컴포넌트 Props 타입

### 3. 유틸리티 파일 변환
- ✅ `/utils/api.ts` - API 클라이언트 (타입 안전한 버전)

### 4. 커스텀 훅 변환
- ✅ `/hooks/useFavorites.ts`
- ✅ `/hooks/useRecentlyViewed.ts`
- ✅ `/hooks/useScrollRestoration.ts`

### 5. 컴포넌트 변환 (샘플)
- ✅ `/components/ProductCard.tsx`

## 🚀 TypeScript 사용법

### 타입 체크 실행
```bash
# 한 번만 실행
npm run type-check

# 파일 변경 시 자동 체크
npm run type-check:watch
```

### 개발 서버 실행
```bash
npm run dev
```

Next.js는 `.ts`, `.tsx` 파일을 자동으로 인식하여 TypeScript를 지원합니다.

## 📝 남은 마이그레이션 작업

### 우선순위 1: 나머지 컴포넌트
다음 컴포넌트들을 TypeScript로 변환해야 합니다:

```bash
components/
├── BrandFilter.js → BrandFilter.tsx
├── CategoryFilter.js → CategoryFilter.tsx
├── DetailedFilters.js → DetailedFilters.tsx
├── FavoriteButton.js → FavoriteButton.tsx
├── Footer.js → Footer.tsx
├── GenderFilter.js → GenderFilter.tsx
├── NotificationToast.js → NotificationToast.tsx
├── PriceHistoryChart.js → PriceHistoryChart.tsx
├── RecentlyViewed.js → RecentlyViewed.tsx
├── SEO.js → SEO.tsx
├── ShareButton.js → ShareButton.tsx
└── ThemeToggle.js → ThemeToggle.tsx
```

### 우선순위 2: 페이지
```bash
pages/
├── _app.js → _app.tsx
├── _document.js → _document.tsx
├── index.js → index.tsx
├── about.js → about.tsx
├── contact.js → contact.tsx
├── favorites.js → favorites.tsx
├── privacy.js → privacy.tsx
├── style-guide.js → style-guide.tsx
├── terms.js → terms.tsx
└── product/[id].js → product/[id].tsx
```

### 우선순위 3: 나머지 유틸리티
```bash
utils/
└── url.js → url.ts
```

## 🔧 마이그레이션 단계별 가이드

### 1. 컴포넌트 변환 예시

#### Before (JavaScript)
```javascript
// components/ProductCard.js
import { useState } from 'react'

function ProductCard({ product, onFavoriteToggle }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div onClick={() => onFavoriteToggle(product)}>
      {product.name}
    </div>
  )
}

export default ProductCard
```

#### After (TypeScript)
```typescript
// components/ProductCard.tsx
import { useState } from 'react'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onFavoriteToggle?: (product: Product) => void
}

function ProductCard({ product, onFavoriteToggle }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  return (
    <div onClick={() => onFavoriteToggle?.(product)}>
      {product.name}
    </div>
  )
}

export default ProductCard
```

### 2. 페이지 변환 예시

#### Before (JavaScript)
```javascript
// pages/index.js
import { useState, useEffect } from 'react'
import { fetchSaleProducts } from '../utils/api'

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchSaleProducts({}).then(setProducts)
  }, [])

  return <div>{/* ... */}</div>
}
```

#### After (TypeScript)
```typescript
// pages/index.tsx
import { useState, useEffect } from 'react'
import { fetchSaleProducts } from '../utils/api'
import type { Product } from '../types'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchSaleProducts({}).then(setProducts)
  }, [])

  return <div>{/* ... */}</div>
}
```

## 💡 TypeScript 팁

### 1. 타입 import
```typescript
// 타입만 import 할 때는 'type' 키워드 사용
import type { Product, Brand } from '../types'

// 런타임 값과 타입을 함께 import
import { fetchProducts } from '../utils/api'
import type { Product } from '../types'
```

### 2. Optional Props
```typescript
interface Props {
  required: string
  optional?: number  // ? 표시로 선택적 prop
  withDefault?: boolean
}

function Component({
  required,
  optional,
  withDefault = false  // 기본값 설정
}: Props) {
  // ...
}
```

### 3. Event Handler 타입
```typescript
// onClick 이벤트
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // ...
}

// onChange 이벤트
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // ...
}

// onKeyDown 이벤트
const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
  // ...
}
```

### 4. useState 타입
```typescript
// 타입 추론 (권장)
const [count, setCount] = useState(0)  // number로 추론

// 명시적 타입 지정
const [products, setProducts] = useState<Product[]>([])
const [user, setUser] = useState<User | null>(null)
```

### 5. useEffect와 async
```typescript
// ❌ 잘못된 방법
useEffect(async () => {
  const data = await fetchData()
}, [])

// ✅ 올바른 방법
useEffect(() => {
  async function loadData() {
    const data = await fetchData()
  }
  loadData()
}, [])

// ✅ 또는 IIFE 사용
useEffect(() => {
  (async () => {
    const data = await fetchData()
  })()
}, [])
```

## 🎯 타입 정의 참고

### 현재 사용 가능한 타입

```typescript
// 브랜드
type Brand = 'HM' | 'ZARA' | 'UNIQLO' | 'MUJI' | 'CHARLESKEITH'

// 성별
type Gender = 'MAN' | 'WOMAN' | 'UNISEX'

// 카테고리
type Category = 'TOP' | 'BOTTOM' | 'OUTER' | 'SHOES' | 'ETC'

// 상품
interface Product {
  id: number
  name: string
  brand: Brand
  category: Category
  gender: Gender
  originalPrice: number
  salePrice: number
  discountRate: number
  imageUrl: string
  productUrl: string
  createdAt?: string
  updatedAt?: string
}
```

더 많은 타입은 `/types/index.ts` 파일을 참고하세요.

## 🔍 타입 체크 에러 해결

### 자주 발생하는 에러

#### 1. 'xxx' is declared but never used
```typescript
// ❌ 사용하지 않는 변수
const unused = 123

// ✅ 해결: 사용하지 않는 변수 제거
```

#### 2. Type 'undefined' is not assignable to...
```typescript
// ❌ undefined일 수 있는 값
const price = product.originalPrice.toFixed(2)

// ✅ 해결: 옵셔널 체이닝 또는 조건 체크
const price = product.originalPrice?.toFixed(2)
const price = product.originalPrice ? product.originalPrice.toFixed(2) : '0'
```

#### 3. Property 'xxx' does not exist on type...
```typescript
// ❌ 타입에 정의되지 않은 속성
product.unknownProp

// ✅ 해결: 타입 정의에 속성 추가 또는 타입 단언 사용
(product as any).unknownProp  // 임시 해결책
```

## 📚 추가 리소스

- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js TypeScript 가이드](https://nextjs.org/docs/basic-features/typescript)

## 🎉 마이그레이션 완료 체크리스트

- [x] TypeScript 설치 및 설정
- [x] 타입 정의 파일 생성
- [x] 유틸리티 파일 변환
- [x] 커스텀 훅 변환
- [x] 샘플 컴포넌트 변환
- [ ] 모든 컴포넌트 변환
- [ ] 모든 페이지 변환
- [ ] 빌드 테스트
- [ ] 타입 체크 통과
- [ ] 기존 JavaScript 파일 제거

---

**참고**: 점진적 마이그레이션이 가능합니다. `.js`와 `.tsx` 파일이 공존할 수 있으므로, 천천히 하나씩 변환하면 됩니다!
