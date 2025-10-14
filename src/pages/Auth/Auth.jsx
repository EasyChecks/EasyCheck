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
      if (e.key === 'Escape' && showReset) setShowReset(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showReset])

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

  return (
    <div className="min-h-screen relative bg-white">
      {/* header */}
      <header className="w-full flex items-center justify-center font-prompt font-bold  md:text-[36px] lg:text-[40px] xl:text-[44px] text-[30px] py-6">
        Login
      </header>

      {/* sticky card (full-width flush to left/right) */}
      <section
        className="font-prompt fixed inset-x-0 bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-lg px-6 pb-8 pt-10 z-40 overflow-hidden"
        style={{ boxShadow: '0 -18px 40px rgba(72,203,255,0.18)' }}
      >
        {/* blue soft-glow */}
        <div
          aria-hidden
          className="absolute -top-6 left-0 right-0 h-12 pointer-events-none"
          style={{
            background:
              'radial-gradient(closest-side at 50% 0%, rgba(72,203,255,0.25), rgba(72,203,255,0.12) 30%, transparent 60%)',
            filter: 'blur(18px)',
          }}
        />

        <div className="space-y-5 relative z-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className=" sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              className="bg-[#F3F3F3]  rounded-md px-4 py-3 w-full outline-none placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[22px] lg:placeholder:text-[26px] xl:placeholder:text-[30px]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className=" sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="bg-[#F3F3F3]  rounded-md px-4 py-3 w-full outline-none pr-12 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[22px] lg:placeholder:text-[26px] xl:placeholder:text-[30px]"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                aria-label="toggle password"
              >
                {showPwd ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.657M6.16 6.16A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.524 2.893M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* primary button */}
          <div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-[#48CBFF] text-white sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px] rounded-xl py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>

          {/* secondary action */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-[#888888]  sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </section>

      {/* Reset Password */}
      {showReset && (
        <div
          className="font-prompt fixed inset-0 z-50 flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReset(false)}
          />

          {/* card */}
          <div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-center font-semibold sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px] mb-4">Reset Password</h2>
            {/* Username */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  value={Username}
                  onChange={(e) => setUsernameReset(e.target.value)}
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  className="bg-[#F3F3F3] rounded-md px-3 py-2 w-full outline-none placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[22px] lg:placeholder:text-[26px] xl:placeholder:text-[30px]"
                />
              </div>
              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={Password}
                    onChange={(e) => setPasswordReset(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่านเดิม"
                    className="bg-[#F3F3F3] rounded-md px-3 py-2 w-full outline-none pr-10 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[22px] lg:placeholder:text-[26px] xl:placeholder:text-[30px]"
                  />
                  {/* toggle password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    aria-label="toggle password"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.657M6.16 6.16A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.524 2.893M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* New Password */}        
              <div className="flex flex-col gap-1">
                <label className="sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={NewPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่านใหม่"
                    className="bg-[#F3F3F3] rounded-md px-3 py-2 w-full outline-none pr-10 placeholder:text-[14px] sm:placeholder:text-[16px] md:placeholder:text-[22px] lg:placeholder:text-[26px] xl:placeholder:text-[30px]"
                  />
                  {/* toggle password */}
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    aria-label="toggle password"
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.657M6.16 6.16A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.524 2.893M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* actions */}
              <button
                className="mt-2 bg-[#48CBFF] text-white rounded-xl py-3 w-full sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]"
                onClick={() => {
                  // placeholder: perform validation / submit
                  setShowReset(false)
                  setUsername('')
                  setPassword('')
                  setNewPassword('')
                }}
              >
                ยืนยัน
              </button>
               {/* back  */}
              <div className="text-center mt-2 sm:text-[18px] md:text-[24px] lg:text[28px] xl:text-[32px] text-[16px]">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="text-[#333]"
                >
                  กลับหน้า Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auth