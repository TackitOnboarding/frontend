import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../../api/api'
import { toastSuccess, toastError } from '../../../utils/toast'
import { Button } from '../../../components/ui/Button'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import TextField from '../../../components/forms/TextField'
import { useUserForm } from '../../../hooks/useUserForm'


export default function SignupPage() {

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [realName, setRealName] = useState('')
  const [realNameTouched, setRealNameTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const nameInvalid =
    (realNameTouched && realName.trim() === '') ||
    (submitted && realName.trim() === '')

  const {
    email,
    password,
    confirmPassword,
    setEmail,
    setPassword,
    setConfirmPassword,
    pwInvalid,
    confirmInvalid,
    emailHasError,
    emailMessage,
    checkEmailDuplicate,
  } = useUserForm('')

  const navigate = useNavigate()

  const canSubmit =
    realName.trim() !== '' &&
    email.trim() !== '' &&
    !emailHasError &&
    password.trim() !== '' &&
    !pwInvalid &&
    confirmPassword.trim() !== '' &&
    !confirmInvalid
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    if (!canSubmit) {
      toastError('입력값을 다시 확인해 주세요.')
      return
    }

    const formData = {
      name: realName,
      email,
      password,
    }

    try {
      await api.post('/auth/sign-up', formData)
      toastSuccess('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch {
      toastError('회원가입 중 문제가 발생했습니다.')
    }
  }

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        <h2 className="mb-8 text-center text-title1-bold text-label-normal">
          회원가입
        </h2>

        <form onSubmit={handleSubmit}>
          <TextField
            id="name"
            label="이름"
            required
            value={realName}
            placeholder="이름을 입력해 주세요."
            onChange={(e) => setRealName(e.target.value)}
            onBlur={() => setRealNameTouched(true)}
            invalid={nameInvalid}
            message={nameInvalid ? '이름을 입력해주세요.' : undefined}
          />

          {/* 이메일 */}
          <TextField
            id="email"
            label="이메일"
            required
            type="email"
            value={email}
            placeholder="이메일을 입력해 주세요."
            onChange={(e) => setEmail(e.target.value)}
            onBlur={checkEmailDuplicate}
            invalid={emailHasError}
            message={emailMessage}
            autoComplete="email"
            inputMode="email"
          />

          {/* 비밀번호 */}
          <TextField
            id="password"
            label="비밀번호"
            required
            type="password"
            value={password}
            placeholder="비밀번호를 입력해 주세요."
            onChange={(e) => setPassword(e.target.value)}
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

          {/* 비밀번호 확인 */}
          <TextField
            id="confirmPassword"
            label="비밀번호 확인"
            required
            type="password"
            value={confirmPassword}
            placeholder="비밀번호를 다시 입력해 주세요."
            onChange={(e) => setConfirmPassword(e.target.value)}
            showToggle
            visible={confirmPasswordVisible}
            onToggle={() => setConfirmPasswordVisible((v) => !v)}
            autoComplete="new-password"
            invalid={confirmInvalid}
            message={
              confirmInvalid ? '비밀번호가 일치하지 않습니다.' : undefined
            }
          />

          {/* 완료(제출) */}
          <Button
            type="submit"
            variant="primary"
            size="m"
            className="w-full mt-4"
            disabled={!canSubmit}
          >
            완료
          </Button>

          {/* 하단 링크 (공통) */}
          <div className="mt-4 text-center text-body-2 text-label-neutral">
            이미 가입된 계정이 있나요?{' '}
            <Link
              to="/login"
              className="ml-1 font-semibold no-underline text-label-primary hover:underline"
            >
              로그인하기
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
