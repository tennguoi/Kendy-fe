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
  Moon,
  Phone,
  Send,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import heroImg from '../../assets/hero.png'
import { authHighlights } from './authHighlights'
import { useToast } from '../../components/Toast'
import { useTheme } from '../../contexts/ThemeContext'
import { toApiUrl } from '../../lib/api'
import { authApi } from '../../api/auth.api'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher'
import { usePublicSiteSettings } from '../public/hooks/usePublicSiteSettings'
import './AuthScreen.css'

const defaultOAuthProviders = [
  { id: 'google', name: 'Google', authorizationUrl: '/oauth2/authorization/google' },
  { id: 'github', name: 'GitHub', authorizationUrl: '/oauth2/authorization/github' },
]

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.64 3.01 8.58 7.18 9.97.52.1.72-.23.72-.5v-1.78c-2.92.64-3.54-1.25-3.54-1.25-.48-1.21-1.17-1.53-1.17-1.53-.95-.65.07-.64.07-.64 1.05.07 1.61 1.08 1.61 1.08.94 1.6 2.46 1.14 3.06.87.09-.68.36-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.19 0-1.15.41-2.08 1.08-2.82-.11-.27-.47-1.34.1-2.78 0 0 .88-.28 2.89 1.08A9.97 9.97 0 0 1 12 6.76c.89 0 1.78.12 2.62.35 2-1.36 2.88-1.08 2.88-1.08.58 1.44.22 2.51.11 2.78.67.74 1.08 1.67 1.08 2.82 0 4.04-2.45 4.92-4.79 5.18.38.33.72.97.72 1.96v2.9c0 .28.19.61.73.5A10.51 10.51 0 0 0 22.5 12c0-5.8-4.7-10.5-10.5-10.5z" />
    </svg>
  )
}

function AuthScreen({ notice, oauthChallenge, onBack, onSuccess }) {
  const { t } = useTranslation()
  const { settings: siteSettings } = usePublicSiteSettings()
  const brand = siteSettings.brand
  const brandName = brand.name || 'Kendy Digital'
  const brandLogo = brand.logoUrl || heroImg
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
  const { theme, toggleTheme } = useTheme()

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
      title: t('auth.loginWith', { provider: provider.name }),
      message: t('auth.oauthRedirect'),
    })
    window.location.assign(toApiUrl(provider.authorizationUrl))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (twoFactorStep?.type === 'oauth') {
      if (!form.twoFactorCode.trim()) {
        setError(t('auth.error.enter2FACode'))
        return
      }

      setBusy(true)
      try {
        const response = await authApi.verifyOAuthTwoFactor({
          challengeToken: twoFactorStep.challengeToken,
          code: form.twoFactorCode.trim(),
        })
        addToast({ type: 'success', title: t('auth.toast.loginTitle'), message: t('auth.success.twoFactor') })
        onSuccess(response, form.remember)
      } catch (err) {
        const msg = err.message || t('auth.error.twoFactorFailed')
        setError(msg)
        addToast({ type: 'error', title: t('auth.toast.authFailed'), message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (isVerify) {
      if (!verifyToken) {
        setError(t('auth.error.enterVerifyCode'))
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterVerifyCode') })
        return
      }

      setBusy(true)
      try {
        await authApi.verifyEmail({ token: verifyToken })
        addToast({ type: 'success', title: t('auth.toast.verifyTitle'), message: t('auth.success.verify') })
        setMode('login')
        setVerifyToken('')
        setVerifyEmail('')
        setForm((current) => ({ ...current, email: verifyEmail }))
      } catch (err) {
        const msg = err.message || t('auth.error.invalidVerifyCode')
        setError(msg)
        addToast({ type: 'error', title: t('common.error'), message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (isForgot) {
      if (!form.email.trim()) {
        setError(t('auth.error.enterEmail'))
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterEmail') })
        return
      }

      setBusy(true)
      try {
        const result = await authApi.forgotPassword({ email: form.email.trim() })
        setResetToken(result.token || result.securityToken)
        setMode('reset')
        addToast({ type: 'success', title: t('auth.toast.forgotTitle'), message: t('auth.success.forgot') })
      } catch (err) {
        const msg = err.message || t('auth.error.forgotFailed')
        setError(msg)
        addToast({ type: 'error', title: t('common.error'), message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (isReset) {
      if (!form.password) {
        setError(t('auth.error.enterNewPassword'))
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterNewPassword') })
        return
      }

      if (form.password !== form.confirmPassword) {
        setError(t('auth.error.passwordMismatch'))
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.passwordMismatch') })
        return
      }

      if (form.password.length < 8) {
        setError(t('auth.error.passwordMinLength'))
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.passwordMinLength') })
        return
      }

      setBusy(true)
      try {
        await authApi.resetPassword({ token: resetToken, newPassword: form.password })
        addToast({ type: 'success', title: t('auth.toast.resetTitle'), message: t('auth.success.reset') })
        setMode('login')
        setResetToken('')
      } catch (err) {
        const msg = err.message || t('auth.error.resetFailed')
        setError(msg)
        addToast({ type: 'error', title: t('common.error'), message: msg })
      } finally {
        setBusy(false)
      }
      return
    }

    if (!form.email.trim() || !form.password) {
      setError(t('auth.error.enterEmailPassword'))
      addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterEmailPassword') })
      return
    }

    if (isRegister && !form.name.trim()) {
      setError(t('auth.error.enterName'))
      addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterName') })
      return
    }

    if (isRegister && form.password !== form.confirmPassword) {
      setError(t('auth.error.passwordMismatch'))
      addToast({ type: 'error', title: t('common.error'), message: t('auth.error.passwordMismatch') })
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
        addToast({ type: 'success', title: t('auth.toast.registerTitle'), message: t('auth.success.register') })
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

      addToast({ type: 'success', title: t('auth.toast.loginTitle'), message: t('auth.success.login') })
      onSuccess(response, form.remember)
    } catch (err) {
      if (!isRegister && String(err.message || '').includes('2FA code required')) {
        setTwoFactorStep({ email: form.email.trim(), type: 'password' })
        updateForm('twoFactorCode', '')
        setError('')
        addToast({ type: 'info', title: t('auth.toast.twoFactorTitle'), message: t('auth.toast.twoFactorInfo') })
        return
      }

      const msg = err.message || (isRegister ? t('auth.error.registerFailed') : t('auth.error.loginFailed'))
      setError(msg)
      addToast({ type: 'error', title: isRegister ? t('auth.toast.registerFailed') : t('auth.toast.loginFailed'), message: msg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-screen">
      <aside className="auth-brand-panel" aria-label={brandName}>
        <div className="pixel-layer" aria-hidden="true" />
        <div className="auth-brand-content">
          <div className="auth-logo-lockup">
            <img src={brandLogo} alt={brandName} />
            <div>
              <strong>{brandName}</strong>
              <span>{brand.tagline || t('auth.heroSubtitle')}</span>
            </div>
          </div>

          <div className="auth-hero-copy">
            <span className="auth-kicker">
              <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
              {t('auth.heroKicker')}
            </span>
            <h1>{brandName}</h1>
            <p>{brand.description || t('auth.heroDescription')}</p>
          </div>

          <div className="auth-highlight-list">
            {authHighlights.map((item) => {
              const Icon = item.icon

              return (
                <article className="auth-highlight" key={item.titleKey}>
                  <Icon size={22} strokeWidth={2} aria-hidden="true" />
                  <div>
                    <strong>{t(item.titleKey)}</strong>
                    <span>{t(item.textKey)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-public-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="auth-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('auth.switchToLight') : t('auth.switchToDark')}
            aria-label={theme === 'dark' ? t('auth.switchToLight') : t('auth.switchToDark')}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
          {onBack && (
            <button type="button" className="auth-home-link" onClick={onBack}>
              <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
              <span>{t('auth.homePage')}</span>
            </button>
          )}
        </div>

        <form key={mode + (twoFactorStep ? '-2fa' : '')} className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <span className="auth-mode-icon" aria-hidden="true">
              {isVerify ? <ShieldCheck size={22} strokeWidth={2} /> : isForgot ? <Mail size={22} strokeWidth={2} /> : isReset ? <KeyRound size={22} strokeWidth={2} /> : isRegister ? <UserRound size={22} strokeWidth={2} /> : <LogIn size={22} strokeWidth={2} />}
            </span>
            <div>
              <span className="eyebrow">{twoFactorStep ? t('auth.twoFactorEyebrow') : isVerify ? t('auth.verifyEyebrow') : isForgot ? t('auth.forgotEyebrow') : isReset ? t('auth.resetEyebrow') : isRegister ? t('auth.registerEyebrow') : t('auth.loginEyebrow')}</span>
              <h2>
                {twoFactorStep
                  ? t('auth.twoFactorTitle')
                  : isVerify ? t('auth.verifyTitle')
                  : isForgot ? t('auth.forgotTitle')
                  : isReset ? t('auth.resetTitle')
                  : isRegister
                    ? t('auth.registerTitle').replace('Kendy Digital', brandName)
                    : t('auth.loginTitle').replace('Kendy Digital', brandName)}
              </h2>
            </div>
          </div>

          <div className="auth-fields">
            {twoFactorStep?.type === 'oauth' && (
              <p className="auth-message">
                {t('auth.oauthNeed2FA', { provider: twoFactorStep.provider || 'OAuth', email: twoFactorStep.email || '' })}
              </p>
            )}

            {isVerify && (
              <>
                <p className="auth-message">{t('auth.verifyCodeSent')} <strong>{verifyEmail}</strong>.</p>
                <label className="auth-field">
                  <span>{t('auth.verifyCodeLabel')}</span>
                  <div className="auth-input">
                    <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                    <input
                      value={verifyToken}
                      onChange={(event) => setVerifyToken(event.target.value.trim())}
                      placeholder={t('auth.verifyPastePlaceholder')}
                    />
                  </div>
                </label>
                <button type="button" className="text-action" disabled={busy} onClick={async () => {
                  setBusy(true)
                  setError('')
                  try {
                    await authApi.resendVerification({ email: verifyEmail })
                    addToast({ type: 'success', title: t('auth.toast.verifyTitle'), message: t('auth.success.resend') })
                  } catch (err) {
                    const msg = err.message || t('auth.error.resendFailed')
                    setError(msg)
                    addToast({ type: 'error', title: t('common.error'), message: msg })
                  } finally {
                    setBusy(false)
                  }
                }}>
                  {t('auth.resendCode')}
                </button>
              </>
            )}

            {isForgot && (
              <label className="auth-field">
                <span>{t('auth.emailLabel')}</span>
                <div className="auth-input">
                  <Mail size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    type="email"
                    autoComplete="email"
                  />
                </div>
              </label>
            )}

            {isReset && (
              <>
                <label className="auth-field">
                  <span>{t('auth.newPasswordLabel')}</span>
                  <div className="auth-input">
                    <LockKeyhole size={18} strokeWidth={2} aria-hidden="true" />
                    <input
                      value={form.password}
                      onChange={(event) => updateForm('password', event.target.value)}
                      placeholder={t('auth.minCharsPlaceholder')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>{t('auth.confirmNewPasswordLabel')}</span>
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
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                    />
                    {form.confirmPassword.length > 0 && (
                      form.confirmPassword === form.password
                        ? <CheckCircle2 size={18} strokeWidth={2} className="confirm-icon match" aria-label={t('auth.match')} />
                        : <span className="confirm-icon mismatch" aria-label={t('auth.mismatch')}>✕</span>
                    )}
                  </div>
                </label>
              </>
            )}

            {!twoFactorStep && !isForgot && !isReset && (
              <label className="auth-field">
                <span>{t('auth.emailLabel')}</span>
                <div className="auth-input">
                  <Mail size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    type="email"
                    autoComplete="email"
                  />
                </div>
              </label>
            )}

            {isRegister && !twoFactorStep && (
              <label className="auth-field">
                <span>{t('auth.nameLabel')}</span>
                <div className="auth-input">
                  <UserRound size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    autoComplete="name"
                  />
                </div>
              </label>
            )}

            {isRegister && !twoFactorStep && (
              <label className="auth-field">
                <span>{t('auth.phoneLabel')}</span>
                <div className="auth-input">
                  <Phone size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.phone}
                    onChange={(event) => updateForm('phone', event.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </label>
            )}

            {!twoFactorStep && !isForgot && !isReset && (
              <label className="auth-field">
                <span>{t('auth.passwordLabel')}</span>
                <div className="auth-input">
                  <LockKeyhole size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.password}
                    onChange={(event) => updateForm('password', event.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </label>
            )}

            {twoFactorStep && (
              <label className="auth-field">
                <span>{t('auth.twoFactorCodeLabel')}</span>
                <div className="auth-input">
                  <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={form.twoFactorCode}
                    onChange={(event) => updateForm('twoFactorCode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('auth.twoFactorPlaceholder')}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
              </label>
            )}

            {isRegister && !twoFactorStep && (
              <label className="auth-field">
                <span>{t('auth.confirmPasswordLabel')}</span>
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
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                  />
                  {form.confirmPassword.length > 0 && (
                    form.confirmPassword === form.password
                      ? <CheckCircle2 size={18} strokeWidth={2} className="confirm-icon match" aria-label={t('auth.match')} />
                      : <span className="confirm-icon mismatch" aria-label={t('auth.mismatch')}>✕</span>
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
                  <span>{t('auth.rememberLogin')}</span>
                </label>
                <button type="button" className="text-action" onClick={() => switchMode('forgot')}>
                  <KeyRound size={16} strokeWidth={2} aria-hidden="true" />
                  {t('auth.forgotPasswordLink')}
                </button>
              </>
            )}
          </div>

          {(error || notice) && <p className={error ? 'auth-message error' : 'auth-message'}>{error || notice}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <>
                <span>{twoFactorStep ? t('auth.submitConfirmCode') : isVerify ? t('auth.submitVerify') : isForgot ? t('auth.submitForgot') : isReset ? t('auth.submitReset') : isRegister ? t('auth.submitRegister') : t('auth.submitLogin')}</span>
                {isForgot ? <Send size={18} strokeWidth={2} aria-hidden="true" /> : <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
              </>
            )}
          </button>

          {!twoFactorStep && !isForgot && !isReset && !isVerify && (
            <>
              <div className="auth-divider">
                <span>{t('auth.orLoginWith')}</span>
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
                      {provider.id === 'github' ? <GithubIcon /> : <GoogleIcon />}
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
                  <span>{t('auth.verifiedEmail')}</span>
                  <button type="button" onClick={() => switchMode('login')}>{t('auth.login')}</button>
                </>
              ) : isForgot || isReset ? (
                <>
                  <span>{t('auth.rememberPassword')}</span>
                  <button type="button" onClick={() => switchMode('login')}>{t('auth.login')}</button>
                </>
              ) : (
                <>
                  {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}
                  <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
                    {isRegister ? t('auth.login') : t('auth.signUpNow')}
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
