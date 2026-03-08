import { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { notificationSSE } from './services/notificationSSE'

import ProfileSelectPage from './pages/Auth/Profiles/ProfileSelectPage'
import OrganizationTypePage from './pages/Auth/Organization/OrganizationTypePage'
import OrganizationSearchPage from './pages/Auth/Organization/OrganizationSearchPage'
import OrganizationFormPage from './pages/Auth/Organization/OrganizationFormPage'
import OrganizationCreatePage from './pages/Auth/Organization/OrganizationCreatePage'
import OrganizationCompletePage from './pages/Auth/Organization/OrganizationCompletePage'

import LoginPage from './pages/Auth/Login/LoginPage'
import SignupPage from './pages/Auth/Signup/SignupPage'

// 게시판 new
import BoardList from './pages/Board/BoardList'
import BoardWrite from './pages/Board/BoardWrite'
import BoardEdit from './pages/Board/BoardEdit'
import BoardDetail from './pages/Board/BoardDetail'

// 캘린더
import CalendarPage from './pages/Calendar/CalendarPage'

// 운영진 페이지
import AccountPage from './pages/Account/AccountPage'

import MainPage from './pages/Main/MainPage'
import MyPage from './pages/MyPage/MyPage'
import EditInfoPage from './pages/MyPage/EditInfoPage'
import MyPostList from './pages/MyPage/MyPostList'
import MyCommentList from './pages/MyPage/MyCommentList'
import Bookmarked from './pages/MyPage/Bookmarked'
import AdminDashboardPage from './pages/AdminPage/AdminDashboardPage'
import AdminUsersPage from './pages/AdminPage/AdminUsersPage'
import AdminReportsPage from './pages/AdminPage/ReportListPage'
import ReportReasonDetailPage from './pages/AdminPage/ReportDetailPage'
import FindEmailPage from './pages/Auth/Login/FindEmail'
import FindPasswordPage from './pages/Auth/Login/FindPassword'
import ResetPasswordPage from './pages/Auth/Login/ResetPassword'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ManagementPage from './pages/Management/ManagementPage'

function App(): JSX.Element {
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || ''
    notificationSSE.start(token)
    return () => notificationSSE.stop()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/profiles" element={<ProfileSelectPage />} />
        <Route path="/organization/type" element={<OrganizationTypePage />} />
        <Route path="/organization/search" element={<OrganizationSearchPage />} />
        <Route path="/organization/form" element={<OrganizationFormPage />} />
        <Route path="/organization/create" element={<OrganizationCreatePage />} />
        <Route path="/organization/complete" element={<OrganizationCompletePage />} />

        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login/find-email" element={<FindEmailPage />} />
        <Route path="/login/find-password" element={<FindPasswordPage />} />
        <Route path="/login/reset-password" element={<ResetPasswordPage />} />
        <Route path="/main" element={<MainPage />} />

        {/* 게시판(new) */}
        <Route path="/board" element={<BoardList />} />
        <Route path="/board/write/:boardType" element={<BoardWrite />} />
        <Route path="/board/edit/:boardType/:id" element={<BoardEdit />} />
        <Route path="/board/:boardType/:id" element={<BoardDetail />} />

        {/* 캘린더 */}
        <Route path="/calendar" element={<CalendarPage />} />

        {/* 회비함 */}
        <Route path="/account" element={<AccountPage />} />

        {/* 운영진 관리 */}
        <Route path="/management" element={<ManagementPage />} />
        

        {/* 게시판 */}
        {/* <Route path="/free" element={<FreePostList />} /> */}
        {/* <Route path="/free/:id" element={<FreePostDetail />} /> */}
        {/* <Route path="/free/write" element={<FreePostWrite />} /> */}
        {/* <Route path="/free/edit/:id" element={<FreePostEdit />} /> */}
        {/* <Route path="/qna" element={<QnaPostList />} /> */}
        {/* <Route path="/qna/:postId" element={<QnaPostDetail />} /> */}
        {/* <Route path="/qna/write" element={<QnaPostWrite />} /> */}
        {/* <Route path="/qna/edit/:postId" element={<QnaPostEdit />} /> */}
        {/* <Route path="/tip" element={<TipPostList />} /> */}
        {/* <Route path="/tip/:id" element={<TipPostDetail />} /> */}
        {/* <Route path="/tip/write" element={<TipPostWrite />} /> */}
        {/* <Route path="/tip/edit/:id" element={<TipPostEdit />} /> */}
        
        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/posts" element={<MyPostList />} />
        <Route path="/mypage/comments" element={<MyCommentList />} />
        <Route path="/mypage/bookmarked" element={<Bookmarked />} />
        <Route path="/mypage/edit-info" element={<EditInfoPage />} />

        {/* 관리자 페이지 */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />{' '}
        <Route path="/admin/reports" element={<AdminReportsPage />} />{' '}
        <Route
          path="/admin/reports/:targetType/:targetId"
          element={<ReportReasonDetailPage />}
        />
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
      />
    </Router>
  )
}

export default App
