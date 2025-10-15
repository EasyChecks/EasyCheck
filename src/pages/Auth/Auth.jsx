import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'


function Auth() {
  const [showPwd, setShowPwd] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form state (inside same file, modal)
  const [Username, setUsernameReset] = useState('')
  const [Password, setPasswordReset] = useState('')
  const [NewPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const { login, getDashboardPath } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter') {
        if (showReset) {
          handleResetConfirm()
        } else {
          handleLogin(e)
        }
      }
      if (e.key === 'Escape' && showReset) setShowReset(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showReset, Username, Password, NewPassword, username, password])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call - replace with actual authentication
      const response = await mockLoginAPI(username, password)

      if (response.success) {
        login(response.user)
        const dashboardPath = getDashboardPath(response.user.role)
        navigate(dashboardPath, { replace: true })
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setLoading(false)
    }
  }

  // Mock login API - replace with actual API call
  const mockLoginAPI = async (username, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock user data based on username
    const mockUsers = {
      'admin': { id: 1, username: 'admin', role: 'admin', name: 'Administrator' },
      'superadmin': { id: 2, username: 'superadmin', role: 'superadmin', name: 'Super Admin' },
      'manager': { id: 3, username: 'manager', role: 'manager', name: 'หัวหน้า' },
      'user': { id: 4, username: 'user', role: 'user', name: 'ผู้ใช้' }
    }

    const user = mockUsers[username.toLowerCase()]
    if (user && password === '123456') {
      return { success: true, user }
    }

    return { success: false }
  }

  function handleResetConfirm() {
    // placeholder: perform validation / submit
    setShowReset(false)
    setUsernameReset('')
    setPasswordReset('')
    setNewPassword('')
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* card login */}
      <section
        className={`font-prompt fixed inset-x-0 bottom-0 left-0 right-0 xl:left-[400px] xl:right-[500px] 2xl:left-[500px] 2xl:right-[500px] bg-white/95 backdrop-blur-sm rounded-t-[28px] shadow-2xl md:px-[60px] lg:px-[80px] xl:px-[40px] px-6 pb-8 pt-6 z-40 overflow-hidden transition-all duration-500 ease-in-out ${
          showReset ? 'opacity-0 scale-95 pointer-events-none translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{ boxShadow: '0 -18px 60px rgba(72,203,255,0.25)' }}
      >
        <div className="space-y-6">
          {/* header */}
          <header className="w-full flex items-center justify-center text-center font-prompt font-bold md:text-[36px] lg:text-[40px] xl:text-[48px] text-[30px] py-3 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Login
          </header>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-2 group">
            <label className="sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px] text-[16px] font-medium text-gray-700 transition-colors group-focus-within:text-cyan-500">
              Username
            </label>
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 w-full outline-none placeholder:text-gray-400 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[16px] lg:placeholder:text-[16px] xl:placeholder:text-[20px] transition-all duration-300 focus:border-cyan-400 focus:bg-white focus:shadow-md"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 group">
            <label className="sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px] text-[16px] font-medium text-gray-700 transition-colors group-focus-within:text-cyan-500">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="กรอกรหัสผ่าน"
                className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 w-full outline-none pr-12 placeholder:text-gray-400 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[16px] lg:placeholder:text-[16px] xl:placeholder:text-[20px] transition-all duration-300 focus:border-cyan-400 focus:bg-white focus:shadow-md"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {/* toggle password */}
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors duration-200"
                aria-label="toggle password"
              >
                {showPwd ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.657M6.16 6.16A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.524 2.893M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* primary button */}
          <div className="flex justify-center pt-2">
            <button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white sm:text-[18px] md:text-[18px] lg:text[18px] xl:text-[24px] text-[16px] font-semibold rounded-xl py-3 px-8 min-w-[200px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>

          {/* secondary action */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-gray-500 hover:text-cyan-500 sm:text-[18px] md:text-[18px] lg:text[18px] xl:text-[24px] text-[16px] transition-colors duration-200 hover:underline underline-offset-4"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </section>

      {/* card reset password (overlay) */}
      {showReset && (
        <section
          className={`font-prompt fixed inset-x-0 bottom-0 left-0 right-0 xl:left-[400px] xl:right-[500px] 2xl:left-[500px] 2xl:right-[500px] bg-white/95 backdrop-blur-sm rounded-t-[28px] shadow-2xl md:px-[60px] lg:px-[80px] xl:px-[40px] px-6 pb-8 pt-6 z-50 overflow-hidden transition-all duration-500 ease-in-out ${
            showReset ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
          style={{ boxShadow: '0 -18px 60px rgba(72,203,255,0.25)' }}
        >
          <div className="space-y-6 relative z-10">
            <header className="w-full flex items-center justify-center text-center font-prompt font-bold md:text-[36px] lg:text-[40px] xl:text-[48px] text-[30px] py-3 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Reset Password
            </header>

            {/* Username */}
            <div className="flex flex-col gap-2 group">
              <label className="sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px] text-[16px] font-medium text-gray-700 transition-colors group-focus-within:text-cyan-500">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                value={Username}
                onChange={(e) => setUsernameReset(e.target.value)}
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 w-full outline-none placeholder:text-gray-400 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[16px] lg:placeholder:text-[16px] xl:placeholder:text-[20px] transition-all duration-300 focus:border-cyan-400 focus:bg-white focus:shadow-md"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 group">
              <label className="sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px] text-[16px] font-medium text-gray-700 transition-colors group-focus-within:text-cyan-500">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  value={Password}
                  onChange={(e) => setPasswordReset(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านเดิม"
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 w-full outline-none pr-12 placeholder:text-gray-400 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[16px] lg:placeholder:text-[16px] xl:placeholder:text-[20px] transition-all duration-300 focus:border-cyan-400 focus:bg-white focus:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors duration-200"
                  aria-label="toggle password"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.657M6.16 6.16A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.524 2.893M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2 group">
              <label className="sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px] text-[16px] font-medium text-gray-700 transition-colors group-focus-within:text-cyan-500">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  value={NewPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านใหม่"
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 w-full outline-none pr-12 placeholder:text-gray-400 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[16px] lg:placeholder:text-[16px] xl:placeholder:text-[20px] transition-all duration-300 focus:border-cyan-400 focus:bg-white focus:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors duration-200"
                  aria-label="toggle password"
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.657M6.16 6.16A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.524 2.893M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* actions */}
            <div className='flex justify-center pt-2'>
              <button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl py-3 sm:text-[18px] md:text-[18px] lg:text[18px] xl:text-[24px] text-[16px] font-semibold px-8 min-w-[200px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  handleResetConfirm()
                  setShowReset(false)
                }}
              >
                ยืนยัน
              </button>
            </div>

            {/* back  */}
            <div className="text-center mt-2 sm:text-[18px] md:text-[18px] lg:text[18px] xl:text-[24px] text-[16px]">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="text-gray-500 hover:text-cyan-500 transition-colors duration-200 hover:underline underline-offset-4"
              >
                กลับหน้า Login
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Auth