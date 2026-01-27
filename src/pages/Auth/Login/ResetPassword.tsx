import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import api from '../../../api/api'
import TextField from '../../../components/forms/TextField'
import AuthResultCard from '../../../components/ui/AuthResultCard'

type ViewStatus = 'form' | 'success'

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={[\]};:'",.<>/?\\|`~]).{8,}$/

export default function ResetPasswordPage(): JSX.Element {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<ViewStatus>('form')

  const navigate = useNavigate()

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  const [touched, setTouched] = useState({
    password: false,
    passwordConfirm: false,
  })

  const isValid = Boolean(password.trim() && passwordConfirm.trim())

  const pwInvalid =
    touched.password && !!password && !PASSWORD_REGEX.test(password)

  const pwConfirmInvalid =
    touched.passwordConfirm && !!passwordConfirm && passwordConfirm !== password

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!isValid) {
      setTouched({ password: true, passwordConfirm: true })
      return
    }

    if (password !== passwordConfirm) {
      setTouched((prev) => ({ ...prev, password: true, passwordConfirm: true }))
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    const resetToken = sessionStorage.getItem('resetPasswordToken')

    if (!resetToken) {
      setError('비밀번호 재설정 정보가 없습니다. 다시 시도해 주세요.')
      return
    }

    try {
      await api.patch(
        '/auth/reset-password',
        { newPassword: password },
        {
          headers: {
            Authorization: `Bearer ${resetToken}`,
          },
        }
      )

      sessionStorage.removeItem('resetPasswordToken')
      setStatus('success')
    } catch (err: any) {
      setError('비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const submitDisabled = !isValid

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      {status === 'success' && (
        <AuthResultCard
          variant="success"
          title="비밀번호가 새로 설정되었어요."
          description="이제 새로운 비밀번호로 로그인할 수 있어요."
          buttonLabel="로그인하기"
          onButtonClick={() => navigate('/login')}
        />
      )}

      {status === 'form' && (
        <AuthCard className="w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
          <h2 className="mb-8 text-center text-title1-bold text-label-normal">
            비밀번호 재설정
          </h2>

          <form onSubmit={handleSubmit} className="w-[392px] mx-auto">
            <TextField
              id="password"
              label="새 비밀번호"
              required
              type="password"
              value={password}
              placeholder="새 비밀번호를 입력해 주세요."
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              showToggle
              visible={passwordVisible}
              onToggle={() => setPasswordVisible((v) => !v)}
              autoComplete="new-password"
              invalid={pwInvalid}
              message={
                pwInvalid
                  ? '대문자와 소문자, 특수문자를 포함해 8자 이상으로 입력해 주세요.'
                  : undefined
              }
            />

            <TextField
              id="passwordConfirm"
              label="새 비밀번호 확인"
              required
              type="password"
              value={passwordConfirm}
              placeholder="새 비밀번호를 다시 입력해 주세요."
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, passwordConfirm: true }))
              }
              showToggle
              visible={confirmPasswordVisible}
              onToggle={() => setConfirmPasswordVisible((v) => !v)}
              autoComplete="new-password"
              invalid={pwConfirmInvalid}
              message={
                pwConfirmInvalid ? '비밀번호가 일치하지 않습니다.' : undefined
              }
            />

            {error && <p className="mt-1 text-sm text-system-red">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="m"
              className="w-full mt-4"
              disabled={submitDisabled}
            >
              완료
            </Button>
          </form>
        </AuthCard>
      )}
    </AuthLayout>
  )
}
