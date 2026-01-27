import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/api'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'
import { Button } from '../../components/ui/Button'
import AuthLayout from '../../components/layouts/AuthLayout'
import { AuthCard } from '../../components/ui/AuthCard'
import TextField from '../../components/forms/TextField'
import RoleSelect, { type Role } from './RoleSelect'
import { useUserForm } from '../../hooks/useUserForm'

// const JOIN_START_YEAR = 2015
const CALENDAR_ICON_PATH = '/icons/calendar.svg'

// type Step = 1 | 2

export default function SignupPage() {
  // const [step, setStep] = useState<Step>(1)

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [realName, setRealName] = useState('')
  const [realNameTouched, setRealNameTouched] = useState(false)

  // 드롭다운 옵션 (입사년도)
  // const yearOptions = useMemo(() => {
  //   const endYear = new Date().getFullYear()
  //   return Array.from(
  //     { length: endYear - JOIN_START_YEAR + 1 },
  //     (_, i) => endYear - i
  //   )
  // }, [])

  // const [joinedYear, setJoinedYear] = useState<number | ''>('')
  // const [joinedYearTouched, setJoinedYearTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // const joinedYearEmpty = joinedYear === ''
  // const joinedYearOutOfRange =
  //   !joinedYearEmpty && !yearOptions.includes(Number(joinedYear))

  // const joinedYearInvalidUi =
  //   (joinedYearTouched && !joinedYearEmpty && joinedYearOutOfRange) ||
  //   (submitted && (joinedYearEmpty || joinedYearOutOfRange))

  // const joinedYearActuallyInvalid = joinedYearEmpty || joinedYearOutOfRange

  // const joinedYearMessage = joinedYearInvalidUi
  //   ? joinedYearEmpty
  //     ? '입사연도를 선택해 주세요.'
  //     : '유효한 연도를 선택해 주세요.'
  //   : undefined

  const nameInvalid =
    (realNameTouched && realName.trim() === '') ||
    (submitted && realName.trim() === '')

  const {
    email,
    password,
    confirmPassword,
    // nickname,
    // organization,
    // role,
    setEmail,
    setPassword,
    setConfirmPassword,
    // setNickname,
    // setOrganization,
    // setRole,
    pwInvalid,
    confirmInvalid,
    // orgInvalid,
    emailHasError,
    emailMessage,
    // nickHasError,
    // nickMessage,
    isFormValid,
    checkEmailDuplicate,
    // checkNicknameDuplicate,
  } = useUserForm('')

  const navigate = useNavigate()

  // 1단계에서 "다음" 버튼 활성화 조건
  const isStep1ValidForNext =
    realName.trim() !== '' &&
    email.trim() !== '' &&
    !emailHasError &&
    password.trim() !== '' &&
    !pwInvalid &&
    confirmPassword.trim() !== '' &&
    !confirmInvalid

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!isStep1ValidForNext) {
      toastWarn('필수 정보를 먼저 입력해 주세요.')
      setRealNameTouched(true)
      return
    }

    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    if (!realName.trim()) {
      toastWarn('이름을 입력해 주세요.')
      return
    }

    if (!role) {
      toastWarn('역할을 선택해 주세요.')
      return
    }

    if (!isFormValid || joinedYearActuallyInvalid) {
      setJoinedYearTouched(true)
      toastError('입력값을 다시 확인해 주세요.')
      return
    }

    const formData = {
      name: realName,
      email,
      password,
      nickname,
      organization,
      role,
      joinedYear: Number(joinedYear),
    }

    try {
      await api.post('/auth/sign-up', formData)
      toastSuccess('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch {
      toastError('회원가입 중 문제가 발생했습니다.')
    }
  }

  const submitDisabled =
    !isFormValid || !role || joinedYearActuallyInvalid || realName.trim() === ''

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        <h2 className="mb-8 text-center text-title1-bold text-label-normal">
          회원가입
        </h2>

        <div className="flex gap-2 mb-8">
          {/* STEP 1 BAR — 항상 클릭 가능 */}
          <div
            onClick={() => setStep(1)}
            className={`
      h-1 flex-1 rounded-full
      cursor-pointer
      ${step >= 1 ? 'bg-interaction-normal' : 'bg-interaction-disable'}
    `}
          />

          {/* STEP 2 BAR — Step1이 유효해야만 이동 가능 */}
          <div
            onClick={() => {
              if (!isStep1ValidForNext) return
              setStep(2)
            }}
            className={`
      h-1 flex-1 rounded-full
      ${step === 2 ? 'bg-interaction-normal' : 'bg-interaction-disable'}
      ${isStep1ValidForNext ? 'cursor-pointer' : 'cursor-default'}
    `}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* ================= 1단계 ================= */}
          {step === 1 && (
            <>
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

              {/* 다음 버튼 */}
              <Button
                type="button"
                variant="primary"
                size="m"
                className="w-full mt-4"
                disabled={!isStep1ValidForNext}
                onClick={handleNextStep}
              >
                다음
              </Button>
            </>
          )}

          {/* ================= 2단계 ================= */}
          {step === 2 && (
            <>
              {/* 닉네임 */}
              <TextField
                id="nickname"
                label="닉네임"
                required
                value={nickname}
                placeholder="닉네임을 입력해 주세요."
                onChange={(e) => setNickname(e.target.value)}
                onBlur={checkNicknameDuplicate}
                showCount
                maxLength={10}
                invalid={nickHasError}
                message={nickMessage}
              />

              {/* 소속 */}
              <TextField
                id="organization"
                label="소속"
                required
                value={organization}
                placeholder="소속을 입력해 주세요."
                onChange={(e) => setOrganization(e.target.value)}
                invalid={orgInvalid}
                message={orgInvalid ? '소속을 입력해 주세요.' : undefined}
              />

              {/* 입사년도 */}
              <TextField
                id="joinedYear"
                label="입사년도"
                required
                value={joinedYear === '' ? '' : String(joinedYear)}
                placeholder="입사연도를 선택해 주세요."
                onChange={(e) => {
                  const v = e.target.value
                  setJoinedYear(v === '' ? '' : Number(v))
                }}
                onBlur={() => {
                  if (joinedYear !== '') setJoinedYearTouched(true)
                }}
                rightIconSrc={CALENDAR_ICON_PATH}
                dropdownOptions={yearOptions}
                invalid={joinedYearInvalidUi}
                message={joinedYearMessage}
              />

              {/* 역할 */}
              <RoleSelect
                className="mb-4"
                value={(role as Role) || ''}
                onChange={(next) => setRole(next)}
                showLabel
              />

              {/* 완료(제출) */}
              <Button
                type="submit"
                variant="primary"
                size="m"
                className="w-full mt-4"
                disabled={submitDisabled}
              >
                완료
              </Button>
            </>
          )}

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
