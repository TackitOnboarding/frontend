import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import api from '../../../api/api'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'

type Profile = {
  memberOrgId: number
  orgName: string
  orgType: string
  nickname: string
  profileImage: string | null
  memberType: string
  memberRole: string
}
type AuthResponse = {
  token: {
    accessToken: string
    refreshToken: string
    accessTokenExpiresIn: number | string
    grantType: string
  }
  profiles: Profile[];
}

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPw, setShowPw] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  // 세션 만료 알림 (만료 3분 전 경고)
  useEffect(() => {
    const hasAccessToken = !!localStorage.getItem('accessToken')
    if (!hasAccessToken) return
    const raw = localStorage.getItem('accessTokenExpiresIn')
    let expMs = raw ? parseInt(raw, 10) : NaN
    if (!Number.isFinite(expMs)) return
    if (expMs < 1e12) expMs = expMs * 1000

    const now = Date.now()
    const threshold = 3 * 60 * 1000
    if (expMs <= now) return

    const warnDelay = Math.max(0, expMs - now - threshold)
    if (warnDelay === 0 && sessionStorage.getItem('warnedSoon') === '1') return

    const id = window.setTimeout(() => {
      alert('세션이 곧 만료됩니다. 자동 연장되거나 다시 로그인해 주세요.')
      sessionStorage.setItem('warnedSoon', '1')
    }, warnDelay)
    return () => clearTimeout(id)
  }, [])

  const isValid = Boolean(email.trim() && password.trim())

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // 1) 이메일 상태 체크
    try {
      await api.get(`/auth/check-email-auth?email=${encodeURIComponent(email)}`)
    } catch (checkError: any) {
      const status = checkError.response?.status as number | undefined
      const message = checkError.response?.data as string | undefined
      if (status === 409 && message === '탈퇴 이력이 있는 이메일입니다.') {
        setError('탈퇴한 이메일입니다. 다른 이메일로 회원가입해주세요.')
        return
      }
      if (status === 409 && message === '이미 가입된 이메일입니다.') {
        // 이미 가입됨 → 로그인 진행
      } else {
        setError(
          '아이디(이메일) 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해 주세요.'
        )
        return
      }
    }

    // 2) 로그인
    try {
      const res = await api.post<AuthResponse>('/auth/sign-in', {
        email,
        password,
      })
      const { token, profiles } = res.data;
      const {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        grantType,
      } = token;

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('accessTokenExpiresIn', String(accessTokenExpiresIn))
      localStorage.setItem('grantType', grantType)

      // 2. 프로필 리스트 전체 저장 (넷플릭스 프로필 선택창 같은 곳에서 쓰기 위함)
      localStorage.setItem('userProfiles', JSON.stringify(profiles));
      
      navigate('/auth/profiles');

    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(
          '아이디(이메일) 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해 주세요.'
        )
      } else {
        setError(
          '아이디(이메일) 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해 주세요.'
        )
      }
    }
  }

  return (
    <AuthLayout
      showCornerLogo={false}
      icons={['/assets/auth/auth-icon.svg']}
      iconOffset={80}
    >
      <AuthCard className="w-full max-w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        <div className="mt-[12px] mb-8 flex items-center justify-center">
          <img src="/logo.svg" alt="Tackit" className="h-[48px]" />
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* 이메일 입력칸 */}
          <div className="mx-auto mb-3 w-[392px]">
            <label
              htmlFor="email"
              className="hidden mb-1 text-sm font-medium text-label-secondary"
            />
            <input
              id="email"
              type="text"
              placeholder="이메일을 입력해 주세요."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              required
              className="h-12 w-full rounded-[12px] border border-line-normal px-3 text-sm outline-none
                         placeholder:text-label-assistive focus:border-line-active"
            />
          </div>

          {/* 비밀번호 입력칸 */}
          <div
            className={`relative mx-auto w-[392px] ${error ? 'mb-3' : 'mb-6'}`}
          >
            <label
              htmlFor="password"
              className="hidden mb-1 text-sm font-medium text-label-secondary"
            />
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="비밀번호를 입력해 주세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-[12px] border border-line-normal px-3 pr-10 text-sm outline-none
               placeholder:text-label-assistive focus:border-line-active"
            />
            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute -translate-y-1/2 right-3 top-1/2"
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            )}
          </div>

          {/* 에러 메시지 (있을 때만) */}
          {error && (
            <p className="mx-auto mb-[24px] w-[392px] whitespace-pre-line text-sm leading-5 text-system-red">
              {error}
            </p>
          )}

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            variant="primary"
            size="m"
            className="mx-auto  h-12 w-[392px]"
            disabled={!isValid}
          >
            로그인
          </Button>
        </form>

        {/* 가입 / 찾기 링크 */}
        <div className="flex items-center justify-center mt-4 text-body-2 text-label-neutral">
          <Link
            to="/signup"
            className="mr-3 font-normal hover:text-label-primary"
          >
            회원가입
          </Link>

          <span className="w-px h-4 mr-3 bg-line-normal" aria-hidden="true" />

          <Link
            to="/login/find-email"
            className="mr-3 font-normal hover:text-label-primary"
          >
            이메일 찾기
          </Link>

          <span className="w-px h-4 mr-3 bg-line-normal" aria-hidden="true" />

          <Link
            to="/login/find-password"
            className="font-normal hover:text-label-primary"
          >
            비밀번호 찾기
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
