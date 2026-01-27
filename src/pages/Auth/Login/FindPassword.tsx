import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import api from '../../../api/api'
import TextField from '../../../components/forms/TextField'
import AuthResultCard from '../../../components/ui/AuthResultCard'

type ViewStatus = 'form' | 'fail'

export default function FindPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')

  const [status, setStatus] = useState<ViewStatus>('form')

  const [touched, setTouched] = useState({
    email: false,
    name: false,
    organization: false,
  })

  const navigate = useNavigate()

  const isValid = Boolean(email.trim() && name.trim() && organization.trim())

  const emailInvalid = touched.email && !email.trim()
  const nameInvalid = touched.name && !name.trim()
  const orgInvalid = touched.organization && !organization.trim()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailFormatInvalid =
    touched.email && email.trim() !== '' && !emailRegex.test(email)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!isValid) {
      setTouched({
        email: true,
        name: true,
        organization: true,
      })
      return
    }

    if (emailFormatInvalid) {
      setError('규칙에 맞는 이메일 주소를 입력해 주세요.')
      return
    }

    try {
      const resp = await api.post('/auth/find-password', {
        email,
        name,
        organization,
      })

      const { resetToken } = resp.data as {
        grantType: string
        resetToken: string
        expiresIn: number
      }

      if (!resetToken) {
        setError('비밀번호 재설정 토큰이 없습니다. 다시 시도해 주세요.')
        return
      }

      sessionStorage.setItem('resetPasswordToken', resetToken)

      navigate('/login/reset-password')
    } catch (err: any) {
      const message =
        err?.response?.data?.message || '비밀번호를 찾을 수 없습니다.'
      setError(message)
      setStatus('fail')
    }
  }

  const submitDisabled = !isValid

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      {status === 'form' && (
        <AuthCard className="w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
          <h2 className="mb-8 text-center text-title1-bold text-label-normal">
            비밀번호 찾기
          </h2>

          <form onSubmit={handleSubmit} className="w-[392px] mx-auto">
            <TextField
              id="email"
              label="이메일"
              required
              type="email"
              value={email}
              placeholder="이메일을 입력해 주세요."
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              invalid={emailInvalid || emailFormatInvalid}
              message={
                emailInvalid
                  ? '이메일을 입력해 주세요.'
                  : emailFormatInvalid
                  ? '규칙에 맞는 이메일 주소를 입력해 주세요.'
                  : undefined
              }
            />

            <TextField
              id="name"
              label="이름"
              required
              value={name}
              placeholder="이름을 입력해 주세요."
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              invalid={nameInvalid}
              message={nameInvalid ? '이름을 입력해 주세요.' : undefined}
            />

            <TextField
              id="organization"
              label="소속"
              required
              value={organization}
              placeholder="소속을 입력해 주세요."
              onChange={(e) => setOrganization(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, organization: true }))
              }
              invalid={orgInvalid}
              message={orgInvalid ? '소속을 입력해 주세요.' : undefined}
            />

            {error && <p className="mt-1 text-sm text-system-red">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="m"
              className="w-full mt-4"
              disabled={submitDisabled}
            >
              다음
            </Button>
          </form>
        </AuthCard>
      )}

      {status === 'fail' && (
        <div className="translate-y-10 md:translate-y-18 lg:translate-y-22">
          <AuthResultCard
            variant="warning"
            title="등록되지 않은 이메일이에요."
            description="입력하신 정보를 다시 확인해주세요."
            buttonLabel="돌아가기"
            onButtonClick={() => setStatus('form')}
          />
        </div>
      )}
    </AuthLayout>
  )
}
