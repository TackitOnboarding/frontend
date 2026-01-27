import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import TextField from '../../../components/forms/TextField'
import api from '../../../api/api'
import AuthResultCard from '../../../components/ui/AuthResultCard'

export default function FindEmailPage(): JSX.Element {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [foundEmail, setFoundEmail] = useState<string | null>(null)
  const [status, setStatus] = useState<'form' | 'success' | 'fail'>('form')

  const [touched, setTouched] = useState({
    name: false,
    organization: false,
  })

  const isValid = Boolean(name.trim() && organization.trim())
  const nameInvalid = touched.name && !name.trim()
  const orgInvalid = touched.organization && !organization.trim()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setFoundEmail(null)

    if (!isValid) {
      setTouched({
        name: true,
        organization: true,
      })
      return
    }

    try {
      const res = await api.post<{ email: string }>('/auth/find-email', {
        name,
        organization,
      })

      const email = res.data.email
      setFoundEmail(email)
      setStatus('success')
    } catch (err: any) {
      const statusCode = err?.response?.status

      if (statusCode === 404) {
        setError('회원을 찾을 수 없습니다.')
      } else {
        setError('이메일 찾기 중 오류가 발생했습니다.')
      }
      setStatus('fail')
    }
  }

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      {/* FORM 화면 */}
      {status === 'form' && (
        <AuthCard className="w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
          <h2 className="mb-8 text-center text-title1-bold text-label-normal">
            이메일 찾기
          </h2>

          <form onSubmit={handleSubmit} className="w-[392px] mx-auto">
            <TextField
              id="name"
              label="이름"
              required
              value={name}
              placeholder="이름을 입력해 주세요."
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              invalid={nameInvalid}
              message={nameInvalid ? '이름을 입력해주세요.' : undefined}
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
              message={orgInvalid ? '소속을 입력해주세요.' : undefined}
            />

            {error && <p className="mt-1 text-sm text-system-red">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="m"
              className="w-full mt-4"
              disabled={!isValid}
            >
              다음
            </Button>
          </form>
        </AuthCard>
      )}

      {/* SUCCESS 화면 */}
      {status === 'success' && foundEmail && (
        <div className="translate-y-10 md:translate-y-18 lg:translate-y-22">
          <AuthResultCard
            variant="success"
            title="등록된 이메일을 찾았어요."
            buttonLabel="로그인하기"
            onButtonClick={() => navigate('/login')}
          >
            {foundEmail}
          </AuthResultCard>
        </div>
      )}

      {/* FAIL 화면 */}
      {status === 'fail' && (
        <div className="translate-y-10 md:translate-y-18 lg:translate-y-22">
          <AuthResultCard
            variant="warning"
            title="입력하신 정보로 등록된 이메일을 찾을 수 없어요."
            description="입력하신 정보를 다시 확인해 주세요."
            buttonLabel="돌아가기"
            onButtonClick={() => setStatus('form')}
          />
        </div>
      )}
    </AuthLayout>
  )
}
