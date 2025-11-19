# 백엔드 개발자를 위한 프론트엔드 가이드

> 이 문서는 백엔드 개발자가 프론트엔드 코드를 이해하기 쉽도록 Spring Boot와 비교하여 설명합니다.

## 📁 프로젝트 구조 비교

### Spring Boot와의 비교
```
Spring Boot                          Next.js (이 프로젝트)
├── controller/                      ├── pages/
│   └── ProductController.java       │   ├── index.js (메인 페이지 = Controller + View)
│                                    │   ├── _app.js (전역 설정)
├── service/                         │   └── products/[id].js (상품 상세)
│   └── ProductService.java          │
│                                    ├── components/
├── repository/                      │   ├── ProductCard.js (재사용 UI 컴포넌트)
│   └── ProductRepository.java       │   ├── BrandFilter.js
│                                    │   └── CategoryFilter.js
├── domain/                          │
│   └── Product.java                 ├── utils/
│                                    │   └── api.js (백엔드 API 호출 = RestTemplate/FeignClient)
└── dto/                             │
    └── ProductResponse.java         ├── hooks/
                                     │   └── useFavorites.js (재사용 로직 = Service 로직)
                                     │
                                     └── styles/
                                         └── Home.module.css (CSS 스타일)
```

### 각 디렉토리 설명

#### 1. `pages/` - Controller + View의 역할
- **Spring Boot의 @Controller + @GetMapping**과 유사
- 파일명이 곧 URL 경로
  - `pages/index.js` → `http://localhost:3000/` (루트)
  - `pages/products/[id].js` → `http://localhost:3000/products/123`
- **역할**:
  - URL 라우팅
  - 데이터 로딩
  - UI 렌더링

```javascript
// pages/index.js
export default function HomePage() {
  // Spring Boot의 Controller 메서드와 비슷
  return <div>메인 페이지</div>
}
```

#### 2. `components/` - 재사용 가능한 UI 조각
- **Spring Boot의 Thymeleaf fragment**와 유사
- 반복되는 UI를 컴포넌트로 분리
- 예: 상품 카드, 버튼, 필터 등

```javascript
// components/ProductCard.js
export default function ProductCard({ product }) {
  // Spring에서 <th:block th:fragment="productCard">와 비슷
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}원</p>
    </div>
  )
}
```

#### 3. `utils/api.js` - 백엔드 API 클라이언트
- **Spring Boot의 RestTemplate, FeignClient**와 동일한 역할
- 백엔드 서버에 HTTP 요청을 보냄

```javascript
// utils/api.js
export async function fetchProducts() {
  // RestTemplate.getForObject()와 동일
  const response = await fetch('http://localhost:8080/api/products')
  return response.json()
}
```

#### 4. `hooks/` - 재사용 가능한 로직
- **Spring Boot의 Service 레이어**와 유사
- 비즈니스 로직을 분리하여 재사용

```javascript
// hooks/useFavorites.js
export default function useFavorites() {
  // ProductService.addFavorite()와 비슷
  const addFavorite = (productId) => {
    // 즐겨찾기 추가 로직
  }
  return { addFavorite }
}
```

---

## 🔄 데이터 흐름 (Data Flow)

### Spring Boot MVC 패턴
```
Client → Controller → Service → Repository → Database
                    ↓
                 Response
```

### Next.js/React 패턴
```
Browser → pages/index.js → utils/api.js → Backend API (Spring Boot)
              ↓
         components/ (UI 렌더링)
              ↓
           User
```

---

## 🧩 주요 개념 설명

### 1. **State (상태)** = **변수 + 자동 UI 업데이트**

```javascript
const [products, setProducts] = useState([])
```

- **Spring Boot와 비교**:
  ```java
  @Getter @Setter
  private List<Product> products = new ArrayList<>();
  ```
- **차이점**:
  - Spring: 값을 변경해도 화면은 자동으로 안 바뀜
  - React: `setProducts()`로 값을 바꾸면 **화면이 자동으로 다시 그려짐**

**왜 이렇게 하나요?**
- 사용자가 버튼을 클릭하면 → state 변경 → 화면 자동 업데이트
- 개발자가 직접 DOM을 조작하지 않아도 됨

---

### 2. **useEffect** = **생명주기 메서드 + 초기화**

```javascript
useEffect(() => {
  // 컴포넌트가 화면에 보일 때 실행
  fetchProducts()
}, []) // 빈 배열 = 처음 한 번만 실행
```

- **Spring Boot와 비교**:
  ```java
  @PostConstruct
  public void init() {
      // 빈이 생성된 후 한 번 실행
  }
  ```

**의존성 배열 (`[]`)의 의미**:
- `[]` (빈 배열): 컴포넌트 마운트 시 **한 번만** 실행
- `[selectedBrand]`: `selectedBrand`가 바뀔 때마다 실행
- 생략: **렌더링할 때마다** 실행 (위험!)

---

### 3. **Props** = **메서드 파라미터**

```javascript
// 부모 컴포넌트
<ProductCard product={productData} />

// 자식 컴포넌트
function ProductCard({ product }) {
  return <div>{product.name}</div>
}
```

- **Spring Boot와 비교**:
  ```java
  public String showProduct(Product product) {
      return product.getName();
  }
  ```

**Props의 특징**:
- 부모 → 자식으로만 전달 (단방향 데이터 흐름)
- 자식은 props를 **읽기만** 가능 (수정 불가)

---

### 4. **API 호출 패턴**

#### Spring Boot에서 외부 API 호출
```java
@Service
public class ProductService {
    private final RestTemplate restTemplate;

    public List<Product> getProducts() {
        return restTemplate.getForObject(
            "http://api.example.com/products",
            ProductList.class
        );
    }
}
```

#### Next.js에서 백엔드 API 호출
```javascript
// utils/api.js
export async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:8080/api/products')

    if (!response.ok) {
      throw new Error('API 요청 실패')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('에러 발생:', error)
    throw error
  }
}

// pages/index.js (사용하는 곳)
useEffect(() => {
  async function loadProducts() {
    const products = await fetchProducts()
    setProducts(products)
  }
  loadProducts()
}, [])
```

---

## 📊 실제 코드 예제 비교

### 상품 목록 조회

#### Spring Boot Controller
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
        @RequestParam(required = false) String brand,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
    ) {
        List<Product> products = productService.getProducts(brand, page, size);
        return ResponseEntity.ok(products);
    }
}
```

#### Next.js 페이지 (pages/index.js)
```javascript
export default function HomePage() {
  // State = 컴포넌트의 데이터 저장소
  const [products, setProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [page, setPage] = useState(0)

  // 상품 불러오기 (Service 로직)
  async function loadProducts() {
    try {
      const data = await fetchSaleProducts({
        brandType: selectedBrand,
        page: page,
        size: 12
      })
      setProducts(data.content) // state 업데이트 → 자동으로 UI 갱신
    } catch (error) {
      console.error('상품 로딩 실패:', error)
    }
  }

  // 컴포넌트가 처음 보일 때 or selectedBrand가 바뀔 때 실행
  useEffect(() => {
    loadProducts()
  }, [selectedBrand, page])

  // UI 렌더링 (View)
  return (
    <div>
      <BrandFilter
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
      />

      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

---

## 🔑 핵심 개념 정리

### 1. **컴포넌트 = 함수 + HTML + 상태**
```javascript
function ProductCard({ product }) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div onClick={() => setIsLiked(!isLiked)}>
      <h3>{product.name}</h3>
      {isLiked && <span>❤️</span>}
    </div>
  )
}
```

### 2. **State 변경 = 화면 자동 갱신**
```javascript
// ❌ 잘못된 방법
products.push(newProduct) // 화면 안 바뀜!

// ✅ 올바른 방법
setProducts([...products, newProduct]) // 화면 자동 갱신
```

### 3. **비동기 처리 (async/await)**
```javascript
// Spring의 CompletableFuture와 비슷
async function loadData() {
  const data = await fetchProducts() // 완료될 때까지 기다림
  setProducts(data)
}
```

---

## 🛠️ 자주 사용하는 패턴

### 1. 필터링 (Spring의 @RequestParam과 유사)
```javascript
const [selectedBrand, setSelectedBrand] = useState('all')

useEffect(() => {
  const params = {
    brand: selectedBrand !== 'all' ? selectedBrand : undefined
  }
  fetchProducts(params)
}, [selectedBrand])
```

### 2. 페이지네이션
```javascript
const [page, setPage] = useState(0)
const [hasMore, setHasMore] = useState(true)

async function loadMore() {
  const data = await fetchProducts({ page: page + 1 })
  setProducts([...products, ...data.content])
  setPage(page + 1)
  setHasMore(!data.last)
}
```

### 3. 에러 처리
```javascript
const [error, setError] = useState(null)

try {
  const data = await fetchProducts()
  setProducts(data)
} catch (err) {
  setError('상품을 불러올 수 없습니다.')
  console.error(err)
}
```

---

## 📚 추가 학습 자료

### React 핵심 개념
1. **State**: 컴포넌트의 상태 (변수 + 자동 렌더링)
2. **Props**: 부모 → 자식 데이터 전달
3. **useEffect**: 부수 효과 처리 (API 호출, 타이머 등)
4. **Event Handler**: 사용자 입력 처리 (onClick, onChange 등)

### Next.js 특징
1. **파일 기반 라우팅**: 파일명 = URL
2. **SSR/SSG**: 서버에서 HTML 생성 (SEO 좋음)
3. **Image 최적화**: 자동 이미지 최적화

---

## 🔍 디버깅 팁

### 1. State 확인
```javascript
console.log('현재 products:', products)
console.log('selectedBrand:', selectedBrand)
```

### 2. useEffect 실행 추적
```javascript
useEffect(() => {
  console.log('useEffect 실행됨! selectedBrand:', selectedBrand)
  loadProducts()
}, [selectedBrand])
```

### 3. API 응답 확인
```javascript
const data = await fetchProducts()
console.log('API 응답:', data)
```

---

## 🎯 실전 팁

### 1. State는 최소한으로
```javascript
// ❌ 나쁜 예: 중복 데이터
const [products, setProducts] = useState([])
const [productCount, setProductCount] = useState(0) // products.length로 계산 가능

// ✅ 좋은 예: 필요한 것만
const [products, setProducts] = useState([])
const productCount = products.length // 계산된 값
```

### 2. useEffect 의존성 배열 주의
```javascript
// ❌ 무한 루프 위험!
useEffect(() => {
  setProducts([...products, newProduct]) // products가 바뀜 → useEffect 다시 실행 → 무한 반복
}, [products])

// ✅ 올바른 방법
useEffect(() => {
  loadProducts() // 한 번만 실행
}, [])
```

### 3. 비동기 함수 처리
```javascript
// ❌ useEffect에 직접 async 사용 불가
useEffect(async () => {
  const data = await fetchProducts() // 에러!
}, [])

// ✅ 내부 함수로 감싸기
useEffect(() => {
  async function load() {
    const data = await fetchProducts()
    setProducts(data)
  }
  load()
}, [])
```

---

## 📖 용어 사전

| React 용어 | Spring Boot 비유 | 설명 |
|-----------|-----------------|------|
| Component | View Template | UI 조각 |
| State | Instance Variable | 컴포넌트의 상태 |
| Props | Method Parameter | 부모 → 자식 데이터 |
| useEffect | @PostConstruct | 생명주기 메서드 |
| Hook | Utility Method | 재사용 로직 |
| fetch | RestTemplate | HTTP 클라이언트 |
| async/await | CompletableFuture | 비동기 처리 |

---

## 💡 마무리

프론트엔드 개발의 핵심은:
1. **State**: 데이터를 저장하고
2. **Props**: 데이터를 전달하고
3. **useEffect**: 부수 효과를 처리하고
4. **JSX**: UI를 렌더링하는 것

Spring Boot를 아신다면 이미 70%는 이해하신 겁니다!
나머지 30%는 "State가 바뀌면 자동으로 화면이 갱신된다"는 React의 핵심만 이해하시면 됩니다.
