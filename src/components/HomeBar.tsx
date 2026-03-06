import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import NotificationBell from './notify/NotificationBell'
import MyInfo from '../pages/MyPage/MyInfo'

const HomeBar: React.FC = () => {
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    [
      'mx-3 px-0 py-2 transition-colors',
      isActive
        ? 'text-body-1sb text-label-normal'
        : 'text-body-1 text-label-assistive hover:text-label-normal',
    ].join(' ')

  return (
    <MyInfo>
      {(myInfo) => (
        <header className="relative flex items-center justify-center bg-white h-14">
          <div className="w-[1100px] flex items-center justify-between mx-auto">
            {/* 좌측: 로고 + 메뉴 */}
            <div className="flex items-center">
              <img
                src="/logo.svg"
                alt="Tackit"
                className="w-[120px] h-10 cursor-pointer mr-10"
                onClick={() => navigate('/main')}
              />
              <nav className="flex items-center">
                <NavLink to={'/main'} className={linkClass} end>
                  홈
                </NavLink>
                <NavLink to={'/board'} className={linkClass}>
                  게시판
                </NavLink>
                <NavLink to={'/calendar'} className={linkClass}>
                  캘린더
                </NavLink>
                <NavLink to={'/executive'} className={linkClass}>
                  회비함
                </NavLink>
                {/* 운영진 전용 메뉴 */}
                {myInfo?.memberRole === 'ADMIN' && (
                  <NavLink to={'/management'} className={linkClass}>
                    관리
                  </NavLink>
                )}
              </nav>
            </div>

            {/* 우측: 알림 + 마이페이지 */}
            <div className="flex items-center">
              <NotificationBell />
              <button
                aria-label="마이페이지로 이동"
                onClick={() => navigate('/mypage')}
                className="ml-4 focus:outline-none"
              >
                <img
                  src={
                    myInfo?.profileImageUrl
                      ? myInfo.profileImageUrl
                      : '/icons/mypage-icon.svg'
                  }
                  alt="마이페이지"
                  className="object-cover w-8 h-8 transition-opacity rounded-full hover:opacity-80"
                />
              </button>
            </div>
          </div>
        </header>
      )}
    </MyInfo>
  )
}

export default HomeBar
