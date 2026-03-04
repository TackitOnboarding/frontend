import axios from 'axios'
import { notificationSSE } from '../services/notificationSSE'

// 1) BASE_URL 안전 기본값
const BASE_URL = process.env.REACT_APP_API_URL || '/api'

// 2) 공용 axios 인스턴스
const api = axios.create({
  baseURL: BASE_URL,
})

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  refreshQueue = []
}

function getAccessTokenExpiryMs(): number | null {
  const raw = localStorage.getItem('accessTokenExpiresIn')
  if (!raw) return null

  let expMs = Number(raw)
  if (!Number.isFinite(expMs)) return null

  if (expMs < 1e12) {
    expMs = expMs * 1000
  }

  return expMs
}

function isAccessTokenExpired(): boolean {
  const expMs = getAccessTokenExpiryMs()
  if (!expMs) return true
  return Date.now() >= expMs
}

function forceLogout() {
  try {
    localStorage.clear()
    notificationSSE.stop?.()
  } catch (_) {}
  window.location.replace('/login')
}

const reissueAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken || refreshToken === 'null') {
      throw Object.assign(new Error('No refresh token'), { status: 401 })
    }

    const response = await axios.post(`${BASE_URL}/auth/reissue`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    })

    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
    } = response.data.token || {}

    if (!accessToken || !newRefreshToken) {
      throw Object.assign(new Error('Invalid reissue payload'), { status: 500 })
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)

    if (accessTokenExpiresIn !== undefined && accessTokenExpiresIn !== null) {
      localStorage.setItem('accessTokenExpiresIn', String(accessTokenExpiresIn))
    }

    try {
      notificationSSE.restartWithToken(accessToken)
    } catch (e) {
      console.warn('notificationSSE restart failed', e)
    }

    return accessToken
  } catch (error) {
    forceLogout()
    throw error
  }
}

const AUTH_FREE = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/check-email-auth',
  '/auth/check-nickname',
  '/auth/rejoin',
  '/auth/reissue',
]

// 3) 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const activeProfileId = localStorage.getItem('activeProfileId'); 
    
    if (activeProfileId) {
      // 모든 요청 헤더에 백엔드가 요구한 키값으로 주입합니다.
      config.headers['Active-Profile-Id'] = activeProfileId;
    }
    
    return config;
  }, (error) => {
    return Promise.reject(error);}
  //   const token = localStorage.getItem('accessToken')
  //   const url = typeof config.url === 'string' ? config.url : ''

  //   if (token && isAccessTokenExpired()) {
  //     const pathname = url.startsWith('/') ? url : `/${url}`
  //     if (!AUTH_FREE.includes(pathname)) {
  //       forceLogout()
  //       return Promise.reject(new axios.Cancel('Token expired'))
  //     }
  //   }

  //   const isAbsolute = /^https?:\/\//i.test(url)
  //   if (isAbsolute) return config

  //   const pathname = url.startsWith('/') ? url : `/${url}`
  //   const isAuthFree = AUTH_FREE.includes(pathname)

  //   if (token && !isAuthFree) {
  //     config.headers = config.headers || {}
  //     config.headers.Authorization = `Bearer ${token}`
  //   }

  //   return config
  // },
  // (error) => Promise.reject(error)
)

// 4) 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config

    // ---- UTH_FREE URL은 그냥 통과시켜서 컴포넌트에서 처리 ----
    const rawUrl =
      typeof originalRequest?.url === 'string' ? originalRequest.url : ''
    const pathname = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`

    if (AUTH_FREE.includes(pathname)) {
      // 로그인/회원가입/이메일체크 등은 토큰 재발급/강제 로그아웃 X
      return Promise.reject(error)
    }

    if (
      (status === 401 || status === 403) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (
        typeof originalRequest.url === 'string' &&
        originalRequest.url.includes('/auth/reissue')
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              if (newToken) {
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }

      // 리프레시 시작
      isRefreshing = true
      try {
        const newAccessToken = await reissueAccessToken()
        processQueue(null, newAccessToken)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch (e) {
        processQueue(e, null)
        throw e
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
