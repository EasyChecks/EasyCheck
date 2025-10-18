import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import PuffLoader from '../../components/common/PuffLoader'
import { getUserForAuth } from '../../data/usersData' // Import helper functions


function Auth() {
  const [searchParams] = useSearchParams()
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
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')

  const { login, getDashboardPath } = useAuth()
  const navigate = useNavigate()

  // Check if coming from Settings with mode=reset
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setShowReset(true)
    }
  }, [searchParams])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter') {
        if (showReset) {
          handleResetConfirm()
        } else {
          handleLogin(e)
        }
      }
      if (e.key === 'Escape' && showReset) {
        setShowReset(false)
        navigate('/auth', { replace: true })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReset, Username, Password, NewPassword, username, password])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call - replace with actual authentication
      const response = await mockLoginAPI(username, password)

      if (response.success) {
        console.log('🔐 Login Success:', response.user) // Debug log
        console.log('👤 User Role:', response.user.role) // Debug log
        console.log('📍 Dashboard Path:', getDashboardPath(response.user.role)) // Debug log
        
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

    // Normalize username to uppercase for employee ID format
    const normalizedUsername = username.toUpperCase()
    
    // Get user from shared data source
    const user = getUserForAuth(normalizedUsername)
    
    if (user && password === user.password) {
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user
      return { success: true, user: userWithoutPassword }
    }

    return { success: false }
  }

  function handleResetConfirm() {
    setResetError('')
    setResetSuccess('')
    
    // Validation
    if (!Username || !Password || !NewPassword) {
      setResetError('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    if (NewPassword.length < 6) {
      setResetError('รหัสผ่านใหม่ต้องมีอักขระอย่างน้อย 6 ตัว')
      return
    }

    // Get stored passwords or use defaults
    const storedPasswords = JSON.parse(localStorage.getItem('mockUserPasswords') || '{}')
    
    // Try to find user in usersData first
    const userData = getUserForAuth(Username)
    
    if (userData) {
      // Regular user from usersData
      if (userData.password !== Password) {
        setResetError('รหัสผ่านเดิมไม่ถูกต้อง')
        return
      }

      // Update user password in usersData
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const updatedUsers = users.map(user => {
        if (user.username === Username) {
          return { ...user, password: NewPassword }
        }
        return user
      })
      localStorage.setItem('users', JSON.stringify(updatedUsers))

      // If user is admin or superadmin, also update their admin account password
      if (userData.role === 'admin' || userData.role === 'superadmin') {
        const adminUsername = `ADM${userData.employeeId}`
        const updatedPasswords = {
          ...storedPasswords,
          [adminUsername.toLowerCase()]: NewPassword
        }
        localStorage.setItem('mockUserPasswords', JSON.stringify(updatedPasswords))
      }

      setResetSuccess('เปลี่ยนรหัสผ่านสำเร็จ! กำลังกลับสู่หน้า Login...')
    } else {
      // Check if it's an admin account (ADM prefix)
      const mockUsers = {
        'admin': { username: 'admin', password: storedPasswords['admin'] || '123456' }
      }

      const user = mockUsers[Username.toLowerCase()]
      
      if (!user) {
        setResetError('ไม่พบชื่อผู้ใช้นี้ในระบบ')
        return
      }

      if (user.password !== Password) {
        setResetError('รหัสผ่านเดิมไม่ถูกต้อง')
        return
      }

      // Update password in localStorage
      const updatedPasswords = {
        ...storedPasswords,
        [Username.toLowerCase()]: NewPassword
      }
      localStorage.setItem('mockUserPasswords', JSON.stringify(updatedPasswords))

      // If it's an admin account (ADM prefix), also update the main user account
      if (Username.toLowerCase().startsWith('adm')) {
        const employeeId = Username.substring(3) // Remove 'ADM' prefix
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const updatedUsers = users.map(user => {
          if (user.employeeId === employeeId && (user.role === 'admin' || user.role === 'superadmin')) {
            return { ...user, password: NewPassword }
          }
          return user
        })
        localStorage.setItem('users', JSON.stringify(updatedUsers))
      }

      setResetSuccess('เปลี่ยนรหัสผ่านสำเร็จ! กำลังกลับสู่หน้า Login...')
    }
    
    // Reset form and close modal after 2 seconds
    setTimeout(() => {
      setShowReset(false)
      setUsernameReset('')
      setPasswordReset('')
      setNewPassword('')
      setResetSuccess('')
      navigate('/auth', { replace: true })
    }, 2000)
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Show PuffLoader when loading */}
      {loading && <PuffLoader text="กำลังเข้าสู่ระบบ..." />}

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
              เข้าสู่ระบบ
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

            {/* Error message */}
            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
                {resetError}
              </div>
            )}

            {/* Success message */}
            {resetSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {resetSuccess}
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-2 group">
              <label className="sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px] text-[16px] font-medium text-gray-700 transition-colors group-focus-within:text-cyan-500">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                value={Username}
                onChange={(e) => {
                  setUsernameReset(e.target.value)
                  setResetError('')
                }}
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
                  onChange={(e) => {
                    setPasswordReset(e.target.value)
                    setResetError('')
                  }}
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
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setResetError('')
                  }}
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
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl py-3 sm:text-[18px] md:text-[18px] lg:text[18px] xl:text-[24px] text-[16px] font-semibold px-8 min-w-[200px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={handleResetConfirm}
                disabled={!Username || !Password || !NewPassword || resetSuccess}
              >
                ยืนยัน
              </button>
            </div>

            {/* back  */}
            <div className="text-center mt-2 sm:text-[18px] md:text-[18px] lg:text[18px] xl:text-[24px] text-[16px]">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false)
                  setResetError('')
                  setResetSuccess('')
                  navigate('/auth', { replace: true })
                }}
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