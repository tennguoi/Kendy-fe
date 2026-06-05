import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogIn,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { authHighlights } from './authHighlights'
import { useToast } from '../../components/Toast'
import { toApiUrl } from '../../lib/api'
import { authApi } from '../../api/auth.api'
import './AuthScreen.css'

const defaultOAuthProviders = [
  { id: 'google', name: 'Google', authorizationUrl: '/oauth2/authorization/google' },
  { id: 'github', name: 'GitHub', authorizationUrl: '/oauth2/authorization/github' },
]

function AuthScreen({ notice, oauthChallenge, onBack, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    remember: true,
    twoFactorCode: '',
  })
  const [twoFactorStep, setTwoFactorStep] = useState(() => (
    oauthChallenge ? {
      challengeToken: oauthChallenge.challengeToken,
      email: oauthChallenge.email,
      provider: oauthChallenge.provider,
      type: 'oauth',
    } : null
  ))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [oauthProviders, setOauthProviders] = useState(defaultOAuthProviders)
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'
  const isReset = mode === 'reset'
  const isVerify = mode === 'verify'
  const [resetToken, setResetToken] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    let isMounted = true

    authApi.getProviders()
      .then((data) => {
        if (isMounted && Array.isArray(data?.providers) && data.providers.length > 0) {
          setOauthProviders(data.providers)
        }
      })
      .catch(() => {
        if (isMounted) {
          setOauthProviders(defaultOAuthProviders)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const switchMode = (target) => {
    setMode((current) => target || (current === 'login' ? 'register' : 'login'))
    setTwoFactorStep(null)
    setResetToken('')
    setError('')
  }

  const startOAuthLogin = (provider) => {
    addToast({
      type: 'info',
      title: `Đăng nhập bằng ${provider.name}`,
      message: 'Bạn sẽ được chuyển sang trang xác thực của nhà cung cấp.',
    })
    window.location.assign(toApiUrl(provider.authorizationUrl))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (twoFactorStep?.type === 'oauth') {
      if (!form.twoFactorCode.trim()) {
        setError('Vui lòng nhập mã xác thực đã gửi qua email.')
        return
      }

      setBusy(true)
      try {
        const response = await authApi.verifyOAuthTwoFactor({
          challengeToken: twoFactorStep.challengeToken,
          code: form.twoFactorCode.trim(),
        })
        addToast({ type: 'success', title: 'Đăng nhập', message: 'Xác thực 2FA thành công.' })
        onSuccess(response, form.remember)
      } catch (err) {
        const msg = err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
        setError(msg)
        addToast({ type: 'error', title: 'Xác thực thất bại', message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (isVerify) {
      if (!verifyToken) {
        setError('Vui lòng nhập mã xác thực từ email.')
        addToast({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập mã xác thực.' })
        return
      }

      setBusy(true)
      try {
        await authApi.verifyEmail({ token: verifyToken })
        addToast({ type: 'success', title: 'Xác thực email', message: 'Email đã được xác thực thành công.' })
        setMode('login')
        setVerifyToken('')
        setVerifyEmail('')
        setForm((current) => ({ ...current, email: verifyEmail }))
      } catch (err) {
        const msg = err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
        setError(msg)
        addToast({ type: 'error', title: 'Lỗi', message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (isForgot) {
      if (!form.email.trim()) {
        setError('Vui lòng nhập email của bạn.')
        addToast({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email.' })
        return
      }

      setBusy(true)
      try {
        const result = await authApi.forgotPassword({ email: form.email.trim() })
        setResetToken(result.token || result.securityToken)
        setMode('reset')
        addToast({ type: 'success', title: 'Quên mật khẩu', message: 'Mã xác nhận đã được gửi tới email của bạn.' })
      } catch (err) {
        const msg = err.message || 'Không gửi được yêu cầu đặt lại mật khẩu.'
        setError(msg)
        addToast({ type: 'error', title: 'Lỗi', message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (isReset) {
      if (!form.password) {
        setError('Vui lòng nhập mật khẩu mới.')
        addToast({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập mật khẩu mới.' })
        return
      }

      if (form.password !== form.confirmPassword) {
        setError('Mật khẩu xác nhận chưa khớp.')
        addToast({ type: 'error', title: 'Lỗi', message: 'Mật khẩu xác nhận chưa khớp.' })
        return
      }

      if (form.password.length < 8) {
        setError('Mật khẩu phải có ít nhất 8 ký tự.')
        addToast({ type: 'error', title: 'Lỗi', message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
        return
      }

      setBusy(true)
      try {
        await authApi.resetPassword({ token: resetToken, newPassword: form.password })
        addToast({ type: 'success', title: 'Đặt lại mật khẩu', message: 'Mật khẩu đã được đặt lại thành công.' })
        setMode('login')
        setResetToken('')
      } catch (err) {
        const msg = err.message || 'Không đặt lại được mật khẩu. Token có thể đã hết hạn.'
        setError(msg)
        addToast({ type: 'error', title: 'Lỗi', message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (!form.email.trim() || !form.password) {
      setError('Vui lòng nhập email và mật khẩu.')
      addToast({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập email và mật khẩu.' })
      return
    }

    if (isRegister && !form.name.trim()) {
      setError('Vui lòng nhập họ tên để tạo tài khoản.')
      addToast({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập họ tên để tạo tài khoản.' })
      return
    }

    if (isRegister && form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      addToast({ type: 'error', title: 'Lỗi', message: 'Mật khẩu xác nhận chưa khớp.' })
      return
    }

    setBusy(true)
    try {
      if (isRegister) {
        const registeredEmail = form.email.trim()
        await authApi.register({
          name: form.name.trim(),
          email: registeredEmail,
          phone: form.phone,
          password: form.password,
        })
        addToast({ type: 'success', title: 'Tạo tài khoản', message: 'Tạo tài khoản thành công. Vui lòng xác thực email.' })
        setVerifyEmail(registeredEmail)
        setMode('verify')
        setForm((current) => ({
          ...current,
          email: registeredEmail,
          password: '',
          confirmPassword: '',
        }))
        return
      }

      const response = await authApi.login({
        email: form.email.trim(),
        password: form.password,
        twoFactorCode: twoFactorStep?.type === 'password' ? form.twoFactorCode.trim() : undefined,
      })

      addToast({ type: 'success', title: 'Đăng nhập', message: 'Đăng nhập thành công.' })
      onSuccess(response, form.remember)
    } catch (err) {
      if (!isRegister && String(err.message || '').includes('2FA code required')) {
        setTwoFactorStep({ email: form.email.trim(), type: 'password' })
        updateForm('twoFactorCode', '')
        const msg = 'Mã xác thực đã được gửi tới email của bạn.'
        setError('')
        addToast({ type: 'info', title: 'Xác thực 2FA', message: msg })
        return
      }

      const msg = err.message || (isRegister
        ? 'Không tạo được tài khoản. Vui lòng kiểm tra lại thông tin.'
        : 'Không đăng nhập được. Kiểm tra email hoặc mật khẩu.')
      setError(msg)
      addToast({ type: 'error', title: isRegister ? 'Đăng ký thất bại' : 'Đăng nhập thất bại', message: msg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-screen">
      <aside className="auth-brand-panel" aria-label="Kendy Digital">
        <div className="pixel-layer" aria-hidden="true" />
        <div className="auth-brand-content">
          <div className="auth-logo-lockup">
            <img src={heroImg} alt="Kendy Digital" />
            <div>
              <strong>Kendy Digital</strong>
              <span>Tài khoản, nâng cấp &amp; quảng cáo Facebook</span>
            </div>
          </div>

          <div className="auth-hero-copy">
            <span className="auth-kicker">
              <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
              Dịch vụ tài khoản và quảng cáo chuyên nghiệp
            </span>
            <h1>Kendy Digital</h1>
            <p>
              Bán tài khoản CapCut, Facebook, nâng cấp tài khoản &amp; dịch vụ chạy quảng cáo.
            </p>
          </div>

          <div className="auth-highlight-list">
            {authHighlights.map((item) => {
              const Icon = item.icon

              return (
                <article className="auth-highlight" key={item.title}>
                  <Icon size={22} strokeWidth={2} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </aside>

      <main className="auth-form-panel">
        {onBack && (
          <button type="button" className="auth-home-link" onClick={onBack}>
            <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
            <span>Trang chủ</span>
          </button>
        )}

        <form key={mode + (twoFactorStep ? '-2fa' : '')} className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <span className="auth-mode-icon" aria-hidden="true">
              {isVerify ? <ShieldCheck size={22} strokeWidth={2} /> : isForgot ? <Mail size={22} strokeWidth={2} /> : isReset ? <KeyRound size={22} strokeWidth={2} /> : isRegister ? <UserRound size={22} strokeWidth={2} /> : <LogIn size={22} strokeWidth={2} />}
            </span>
            <div>
              <span className="eyebrow">{twoFactorStep ? 'Xác thực 2FA' : isVerify ? 'Xác thực email' : isForgot ? 'Quên mật khẩu' : isReset ? 'Đặt lại mật khẩu' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
              <h2>
                {twoFactorStep
                  ? 'Nhập mã xác thực đã gửi qua email.'
                  : isVerify ? 'Nhập mã xác thực đã gửi tới email của bạn.'
                  : isForgot ? 'Nhập email để nhận mã đặt lại mật khẩu.'
                  : isReset ? 'Nhập mật khẩu mới cho tài khoản của bạn.'
                  : isRegister ? 'Bắt đầu với Kendy Digital' : 'Chào mừng bạn quay lại Kendy Digital.'}
              </h2>
            </div>
          </div>

          <div className="auth-fields">
            {twoFactorStep?.type === 'oauth' && (
              <p className="auth-message">
                Đăng nhập bằng {twoFactorStep.provider || 'OAuth'} cần mã xác thực gửi tới {twoFactorStep.email || 'email của bạn'}.
              </p>
            )}

            {isVerify && (
              <>
                <p className="auth-message">Mã xác thực đã được gửi tới <strong>{verifyEmail}</strong>.</p>
                <label className="auth-field">
                  <span>Mã xác thực</span>
                  <div className="auth-input">
                    <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                    <input
                      value={verifyToken}
                      onChange={(event) => setVerifyToken(event.target.value.trim())}
                      placeholder="Dán mã từ email"
                    />
                  </div>
                </label>
                <button type="button" className="text-action" disabled={busy} onClick={async () => {
                  setBusy(true)
                  setError('')
                  try {
                    await authApi.resendVerification({ email: verifyEmail })
                    addToast({ type: 'success', title: 'Xác thực email', message: 'Đã gửi lại mã xác thực.' })
                  } catch (err) {
                    const msg = err.message || 'Không gửi được mã xác thực.'
                    setError(msg)
                    addToast({ type: 'error', title: 'Lỗi', message: msg })
                  } finally {
                    setBusy(false)
                  }
                }}>
                  Gửi lại mã
                </button>
              </>
            )}

            {isForgot && (
              <label className="auth-field">
                <span>Email</span>
                <div className="auth-input">
                  <Mail size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    placeholder="email@kendy.vn"
                    type="email"
                    autoComplete="email"
                  />
                </div>
              </label>
            )}

            {isReset && (
              <>
                <label className="auth-field">
                  <span>Mật khẩu mới</span>
                  <div className="auth-input">
                    <LockKeyhole size={18} strokeWidth={2} aria-hidden="true" />
                    <input
                      value={form.password}
                      onChange={(event) => updateForm('password', event.target.value)}
                      placeholder="Ít nhất 8 ký tự"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>Xác nhận mật khẩu mới</span>
                  <div className={
                    'auth-input' +
                    (form.confirmPassword.length > 0
                      ? form.confirmPassword === form.password
                        ? ' input-match'
                        : ' input-mismatch'
                      : '')
                  }>
                    <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                    <input
                      value={form.confirmPassword}
                      onChange={(event) => updateForm('confirmPassword', event.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                    />
                    {form.confirmPassword.length > 0 && (
                      form.confirmPassword === form.password
                        ? <CheckCircle2 size={18} strokeWidth={2} className="confirm-icon match" aria-label="Khớp" />
                        : <span className="confirm-icon mismatch" aria-label="Chưa khớp">✕</span>
                    )}
                  </div>
                </label>
              </>
            )}

            {!twoFactorStep && !isForgot && !isReset && (
              <label className="auth-field">
                <span>Email</span>
                <div className="auth-input">
                  <Mail size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    placeholder="email@kendy.vn"
                    type="email"
                    autoComplete="email"
                  />
                </div>
              </label>
            )}

            {isRegister && !twoFactorStep && (
              <label className="auth-field">
                <span>Họ tên</span>
                <div className="auth-input">
                  <UserRound size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                  />
                </div>
              </label>
            )}

            {isRegister && !twoFactorStep && (
              <label className="auth-field">
                <span>Số điện thoại</span>
                <div className="auth-input">
                  <Phone size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.phone}
                    onChange={(event) => updateForm('phone', event.target.value)}
                    placeholder="0900000000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </label>
            )}

            {!twoFactorStep && !isForgot && !isReset && (
              <label className="auth-field">
                <span>Mật khẩu</span>
                <div className="auth-input">
                  <LockKeyhole size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.password}
                    onChange={(event) => updateForm('password', event.target.value)}
                    placeholder="Nhập mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </label>
            )}

            {twoFactorStep && (
              <label className="auth-field">
                <span>Mã xác thực email</span>
                <div className="auth-input">
                  <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.twoFactorCode}
                    onChange={(event) => updateForm('twoFactorCode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Nhập mã 6 số"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
              </label>
            )}

            {isRegister && !twoFactorStep && (
              <label className="auth-field">
                <span>Xác nhận mật khẩu</span>
                <div className={
                  'auth-input' +
                  (form.confirmPassword.length > 0
                    ? form.confirmPassword === form.password
                      ? ' input-match'
                      : ' input-mismatch'
                    : '')
                }>
                  <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.confirmPassword}
                    onChange={(event) => updateForm('confirmPassword', event.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                  />
                  {form.confirmPassword.length > 0 && (
                    form.confirmPassword === form.password
                      ? <CheckCircle2 size={18} strokeWidth={2} className="confirm-icon match" aria-label="Khớp" />
                      : <span className="confirm-icon mismatch" aria-label="Chưa khớp">✕</span>
                  )}
                </div>
              </label>
            )}
          </div>

          <div className="auth-options">
            {!isRegister && !twoFactorStep && !isForgot && !isReset && (
              <>
                <label className="checkbox-row">
                  <input
                    checked={form.remember}
                    onChange={(event) => updateForm('remember', event.target.checked)}
                    type="checkbox"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button" className="text-action" onClick={() => switchMode('forgot')}>
                  <KeyRound size={16} strokeWidth={2} aria-hidden="true" />
                  Quên mật khẩu?
                </button>
              </>
            )}
          </div>

          {(error || notice) && <p className={error ? 'auth-message error' : 'auth-message'}>{error || notice}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>Đang xử lý…</span>
              </>
            ) : (
              <>
                <span>{twoFactorStep ? 'Xác nhận mã' : isVerify ? 'Xác thực' : isForgot ? 'Gửi yêu cầu' : isReset ? 'Đặt lại mật khẩu' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
                {isForgot ? <Send size={18} strokeWidth={2} aria-hidden="true" /> : <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
              </>
            )}
          </button>

          {!twoFactorStep && !isForgot && !isReset && !isVerify && (
            <>
              <div className="auth-divider">
                <span>Hoặc đăng nhập bằng</span>
              </div>

              <div className="oauth-actions">
                {oauthProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    className={`oauth-button ${provider.id}`}
                    onClick={() => startOAuthLogin(provider)}
                  >
                    <span className="oauth-icon" aria-hidden="true">
                      {provider.id === 'github' ? 'GH' : 'G'}
                    </span>
                    <span>{provider.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {!twoFactorStep && (
            <p className="auth-switch">
              {isVerify ? (
                <>
                  <span>Đã xác thực email?</span>
                  <button type="button" onClick={() => switchMode('login')}>Đăng nhập</button>
                </>
              ) : isForgot || isReset ? (
                <>
                  <span>Nhớ mật khẩu?</span>
                  <button type="button" onClick={() => switchMode('login')}>Đăng nhập</button>
                </>
              ) : (
                <>
                  {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                  <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
                    {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                  </button>
                </>
              )}
            </p>
          )}
        </form>
      </main>
    </section>
  )
}

export default AuthScreen
