/**
 * 사용자 폼 상태 관리 훅
 * - 입력 값 및 에러 메시지 상태 관리
 * - 실시간 유효성 검사 및 중복 확인 지원
 */

import { useState } from 'react'
import api from '../api/api'
import type { AxiosError } from 'axios'

type CheckEmailErrorBody = string | { message?: string } | undefined

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={[\]};:'",.<>/?\\|`~]).{8,}$/

export function useUserForm(initialRole = '') {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [organization, setOrganization] = useState('')
  const [memberType, setMemberType] = useState(initialRole)

  // 모임 생성하기의 Form
  const [organizationName, setOrganizationName] = useState(''); // 모임 이름 상태 추가
  const [orgNameServerError, setOrgNameServerError] = useState(''); // 서버 중복 에러 상태
  const [orgNameCheckMessage, setOrgNameCheckMessage] = useState(''); // 성공 메시지 상태

  const [emailCheckMessage, setEmailCheckMessage] = useState('')
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('')
  const [emailServerError, setEmailServerError] = useState('')
  const [nickServerError, setNickServerError] = useState('')

  // ✅ 가벼운 계산은 그냥 바로 계산
  const emailInvalid = !!email && !/^\S+@\S+\.\S+$/.test(email)
  const pwInvalid = !!password && !PASSWORD_REGEX.test(password)
  const confirmInvalid = !!confirmPassword && confirmPassword !== password
  const nickInvalid = !!nickname && nickname.length > 10
  const orgInvalid = !!organization && organization.trim().length === 0
  const orgNameInvalid = !!organizationName && organizationName.length > 20;

  const emailHasError = (!!email && emailInvalid) || !!emailServerError
  const emailMessage = emailInvalid
    ? '규칙에 맞는 이메일 주소를 입력해 주세요.'
    : emailServerError || emailCheckMessage

  const nickHasError = (!!nickname && nickInvalid) || !!nickServerError
  const nickMessage = nickInvalid
    ? '닉네임은 10자 이내로 입력해 주세요.'
    : nickServerError || nicknameCheckMessage

  const orgNameHasError = (!!organizationName && orgNameInvalid) || !!orgNameServerError;
  const orgNameMessage = orgNameInvalid 
    ? '모임 이름은 20자 이내로 입력해 주세요.' 
    : orgNameServerError || orgNameCheckMessage;

  const isFormValid = Boolean(
    email &&
      !emailInvalid &&
      password &&
      !pwInvalid &&
      confirmPassword &&
      !confirmInvalid &&
      nickname &&
      !nickInvalid &&
      organization &&
      !orgInvalid &&
      memberType
  )

  const checkEmailDuplicate = async () => {
    setEmailServerError('')
    setEmailCheckMessage('')
    if (!email || emailInvalid) return
    try {
      const encoded = encodeURIComponent(email)
      const res = await api.get(`/auth/check-email-auth?email=${encoded}`)
      if (res.status === 200) setEmailCheckMessage('사용 가능한 이메일입니다.')
    } catch (e: unknown) {
      const err = e as AxiosError<CheckEmailErrorBody>
      const msg =
        (typeof err.response?.data === 'string'
          ? err.response?.data
          : err.response?.data?.message) || ''
      if (msg === '이미 가입된 이메일입니다.') {
        setEmailServerError('이미 사용 중인 이메일입니다.')
      } else if (msg === '탈퇴 이력이 있는 이메일입니다.') {
        setEmailServerError(
          '해당 이메일은 탈퇴 이력이 있어 사용할 수 없습니다.'
        )
      } else {
        setEmailServerError('이메일 확인 중 오류 발생')
      }
    }
  }

  const checkNicknameDuplicate = async () => {
    setNickServerError('')
    setNicknameCheckMessage('')

    if (!nickname || nickInvalid) return
    setNicknameCheckMessage('닉네임 형식이 올바릅니다.');
  }

  // 모임 이름 중복 체크 API (나중에 엔드포인트만 수정하세요)
  const checkOrganizationNameDuplicate = async (schoolName?: string) => {
    setOrgNameServerError('');
    setOrgNameCheckMessage('');

    if (!organizationName || orgNameInvalid) return;

    try {
      // 실제 API 예시 (학교명이 있으면 같이 보냄)
      // const encoded = encodeURIComponent(organizationName);
      // await api.get(`/auth/check-org-name?name=${encoded}&school=${schoolName}`);
      
      // ✅ 테스트용 목데이터 로직 (DACOS 입력 시 에러 발생)
      if (["DACOS", "SOLUX", "tackit"].includes(organizationName)) {
        setOrgNameServerError('이미 등록된 모임입니다.');
      } else {
        setOrgNameCheckMessage('사용 가능한 이름입니다.');
      }
    } catch (e: unknown) {
      setOrgNameServerError('중복 확인 중 오류 발생');
    }
  };

  return {
    // 상태
    email,
    password,
    confirmPassword,
    nickname,
    organization,
    memberType,
    setEmail,
    setPassword,
    setConfirmPassword,
    setNickname,
    setOrganization,
    setMemberType,
    organizationName,
    setOrganizationName,

    // 유효성
    emailInvalid,
    pwInvalid,
    confirmInvalid,
    nickInvalid,
    orgInvalid,
    emailHasError,
    emailMessage,
    nickHasError,
    nickMessage,
    isFormValid,
    orgNameHasError,
    orgNameMessage,

    // API
    setNickServerError,
    setNicknameCheckMessage,
    checkEmailDuplicate,
    checkNicknameDuplicate,
    checkOrganizationNameDuplicate,
  }
}
