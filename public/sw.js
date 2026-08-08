// 캐시 이름에 버전을 올려야 기존 사용자의 브라우저가 옛 자산을 버리고 새로 받아갑니다.
// (activate 단계에서 CACHE_NAME이 다른 캐시를 전부 삭제하도록 되어 있습니다)
const CACHE_NAME = 'spa-sale-archive-v2'
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    // 상품 이미지 폴백 — 구 SVG에서 브랜드 팔레트에 맞춘 JPG로 교체되었습니다.
    '/placeholder-product.jpg'
]

/**
 * 서비스 워커 설치 (Install)
 * - 앱이 처음 설치될 때 실행됩니다.
 * - 핵심 정적 자원(HTML, 아이콘 등)을 미리 캐싱(Pre-caching)하여 오프라인에서도 기본 화면이 뜨도록 합니다.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    // 대기 상태 없이 즉시 활성화
    self.skipWaiting()
})

/**
 * 서비스 워커 활성화 (Activate)
 * - 새로운 버전의 서비스 워커가 활성화될 때 실행됩니다.
 * - 이전 버전의 캐시를 정리하여 용량을 확보하고 최신 리소스를 유지합니다.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache)
                    }
                })
            )
        })
    )
    // 모든 클라이언트(탭) 제어권 즉시 획득
    self.clients.claim()
})

/**
 * 네트워크 요청 가로채기 (Fetch)
 * - 앱에서 발생하는 모든 네트워크 요청을 가로챕니다.
 * - 캐시에 있는 자원은 캐시에서 바로 반환(Cache First)하여 속도를 높입니다.
 * - API 요청이나 외부 이미지는 네트워크를 우선 사용합니다.
 */
self.addEventListener('fetch', (event) => {
    // API 요청이나 외부 이미지는 캐시하지 않거나 별도 전략 사용 (여기서는 네트워크 우선)
    if (event.request.url.includes('/api/') || event.request.url.includes('http')) {
        return
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // 캐시에 있으면 반환, 없으면 네트워크 요청
            return response || fetch(event.request)
        })
    )
})
