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
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { authHighlights } from '../../data/authHighlights'
import { useToast } from '../../components/Toast'
import { apiRequest, toApiUrl } from '../../lib/api'
import './AuthScreen.css'

const defaultOAuthProviders = [
  { id: 'google', name: 'Google', authorizationUrl: '/oauth2/authorization/google' },
  { id: 'github', name: 'GitHub', authorizationUrl: '/oauth2/authorization/github' },
]

function AuthScreen({ notice, onBack, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    remember: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [oauthProviders, setOauthProviders] = useState(defaultOAuthProviders)
  const isRegister = mode === 'register'
  const { addToast } = useToast()

  useEffect(() => {
    let isMounted = true

    apiRequest('/api/auth/oauth2/providers')
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

  const switchMode = () => {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
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
        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone,
            password: form.password,
          },
        })
        addToast({ type: 'success', title: 'Tạo tài khoản', message: 'Tạo tài khoản thành công.' })
      }

      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: form.email.trim(),
          password: form.password,
        },
      })

      addToast({ type: 'success', title: 'Đăng nhập', message: 'Đăng nhập thành công.' })
      onSuccess(response, form.remember)
    } catch {
      const msg = isRegister
        ? 'Không tạo được tài khoản. Vui lòng kiểm tra lại thông tin.'
        : 'Không đăng nhập được. Kiểm tra email hoặc mật khẩu.'
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

        <form key={mode} className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <span className="auth-mode-icon" aria-hidden="true">
              {isRegister ? <UserRound size={22} strokeWidth={2} /> : <LogIn size={22} strokeWidth={2} />}
            </span>
            <div>
              <span className="eyebrow">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
              <h2>{isRegister ? 'Bắt đầu với Kendy Digital' : 'Chào mừng bạn quay lại Kendy Digital.'}</h2>
            </div>
          </div>

          <div className="auth-fields">
            {isRegister && (
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

            {isRegister && (
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

            {isRegister && (
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
            {!isRegister && (
              <>
                <label className="checkbox-row">
                  <input
                    checked={form.remember}
                    onChange={(event) => updateForm('remember', event.target.checked)}
                    type="checkbox"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button" className="text-action">
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
                <span>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </button>

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

          <p className="auth-switch">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button type="button" onClick={switchMode}>
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </p>
        </form>
      </main>
    </section>
  )
}

export default AuthScreen
