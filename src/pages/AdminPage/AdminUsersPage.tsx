/**
 * 관리자 회원 관리 페이지
 * - 회원 목록 조회 및 상태(전체/사용중/탈퇴) 필터링
 * - 페이지네이션으로 목록 표시
 */
import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from './layout/AdminLayout'
import TagChips from '../../components/TagChips'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './AdminUsersPage.css'

type RawUser = {
  nickname: string
  email: string
  status: 'ACTIVE' | 'DELETED'
  createdAt: string
}

type ViewUser = {
  id: number
  nickname: string
  email: string
  status: '사용중' | '탈퇴'
  joinedAt: string
}

const USERS_PER_PAGE = 10

const normalize = (arr: RawUser[]): ViewUser[] =>
  arr.map((u, i) => ({
    id: i + 1,
    nickname: u.nickname,
    email: u.email,
    status: u.status === 'DELETED' ? '탈퇴' : '사용중',
    joinedAt: u.createdAt,
  }))

export default function UserManagementPage() {
  const [users, setUsers] = useState<ViewUser[]>([])
  const [filter, setFilter] = useState<'전체' | '사용중' | '탈퇴'>('전체')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const role = localStorage.getItem('role')
  const filterToId = filter === '전체' ? 0 : filter === '사용중' ? 1 : 2

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken')
      try {
        const res = await api.get<RawUser[]>('/api/admin/members', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        setUsers(normalize(res.data ?? []))
      } catch (e) {
        console.error('회원 목록 조회 실패', e)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    if (role === 'ADMIN') {
      fetchUsers()
    } else {
      setUsers([])
      setLoading(false)
    }
  }, [role])

  const filtered = useMemo(() => {
    const base =
      filter === '전체' ? users : users.filter((u) => u.status === filter)
    return base.sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    )
  }, [users, filter])

  useEffect(() => {
    const pages = Math.max(Math.ceil(filtered.length / USERS_PER_PAGE), 1)
    setTotalPages(pages)
    if (currentPage > pages) setCurrentPage(1)
  }, [filtered, currentPage])

  const pageUsers = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
      ),
    [filtered, currentPage]
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="ml-[36px] mt-[32px]">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-[var(--line-normal)]">
            로딩 중...
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="ml-[36px] mt-[32px]">
        <h1 className="text-[var(--label-normal)] font-bold text-[24px] mb-[20px]">
          회원 목록
        </h1>

        <div className="user-management-page">
          <TagChips
            includeAllItem
            value={filterToId}
            // fallbackTags={[
            //   { id: 1, name: '사용중' },
            //   { id: 2, name: '탈퇴' },
            // ]}
            onChange={(v) => {
              if (v === 0) setFilter('전체')
              else if (v === 1) setFilter('사용중')
              else setFilter('탈퇴')
              setCurrentPage(1)
            }}
            className="relative z-[20] mb-[20px]"
            gapPx={10}
          />
        </div>

        {/* 표 카드 */}
        <div className="bg-white w-[1086px] rounded-2xl overflow-hidden pt-[40px] pb-[16px] px-[24px]">
          <div className="overflow-hidden bg-white rounded-xl">
            <table className="w-full table-fixed border-collapse text-[15px]">
              <thead className="bg-[var(--background-neutral)] text-left text-[var(--label-neutral)]">
                <tr>
                  <th className="pl-[32px] w-[25%] py-[14px] align-middle whitespace-nowrap leading-[22px] text-body-2">
                    닉네임
                  </th>
                  <th className="w-[35%] py-[14px] align-middle whitespace-nowrap leading-[22px] text-body-2">
                    이메일
                  </th>
                  <th className="w-[20%] py-[14px] align-middle whitespace-nowrap leading-[22px] text-body-2">
                    상태
                  </th>
                  <th className="w-[20%] pr-[32px] py-[14px] text-left align-middle whitespace-nowrap leading-[22px] text-body-2">
                    가입 일자
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[var(--line-normal)] text-body-1"
                  >
                    <td className="pl-[32px] py-[14px] align-middle text-[var(--label-normal)]">
                      {u.nickname}
                    </td>
                    <td className="py-[14px] align-middle text-[var(--label-normal)]">
                      {u.email}
                    </td>
                    <td className="py-[14px] align-middle">
                      {u.status === '사용중' ? (
                        <span className="inline-flex items-center justify-center px-[10px] py-[4px] rounded-md bg-[var(--background-blue)] text-[var(--label-primary)] text-body-2">
                          사용중
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-[10px] py-[4px] rounded-md bg-[var(--background-neutral)] text-[var(--label-normal)] text-body-2">
                          탈퇴
                        </span>
                      )}
                    </td>
                    <td className="pr-[32px] py-[14px] align-middle text-[var(--label-normal)] text-body-1">
                      <div className="flex flex-col items-start justify-center h-full">
                        <span>{u.joinedAt}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-[12px] mb-[16px]">
              <PaginationGroup
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
