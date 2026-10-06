import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Mail,
  Moon,
  Send,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import heroImg from '../../assets/hero.png';
import { authHighlights } from './authHighlights';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../contexts/ThemeContext';
import { toApiUrl } from '../../lib/api';
import { authApi } from '../../api/auth.api';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { usePublicSiteSettings } from '../public/hooks/usePublicSiteSettings';
import './AuthScreen.css';

// Import base components and validation utilities
import BaseInput from '../../components/ui/BaseInput';
import TurnstileWidget from '../../components/Turnstile/TurnstileWidget';
import { isValidEmail, isRequired, minLength, composeValidators, isValidPhoneVn, validatePhoneVn, isMatching } from '../../utils/validation';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

const defaultOAuthProviders = [
  { id: 'google', name: 'Google', authorizationUrl: '/oauth2/authorization/google' },
  { id: 'github', name: 'GitHub', authorizationUrl: '/oauth2/authorization/github' }
];

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
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.64 3.01 8.58 7.18 9.97.52.1.72-.23.72-.5v-1.78c-2.92.64-3.54-1.25-3.54-1.25-.48-1.21-1.17-1.53-1.17-1.53-.95-.65.07-.64.07-.64 1.05.07 1.61 1.08 1.61 1.08.94 1.6 2.46 1.14 3.06.87.09-.68.36-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.19 0-1.15.41-2.08 1.08-2.82-.11-.27-.47-1.34.1-2.78 0 0 .88-.28 2.89 1.08A9.97 9.97 0 0 1 12 6.76c.89 0 1.78.12 2.62.35 2-1.36 2.88-1.08 2.88-1.08.58 1.44.22 2.51.11 2.78.67.74 1.08 1.67 1.08 2.82 0 4.04-2.45 4.92-4.79 5.18.38.33.72.97.72 1.96v2.9c0 .28.19.61.73.5A10.51 10.51 0 0 0 22.5 12c0-5.8-4.7-10.5-10.5-10.5z" />
    </svg>
  );
}

function AuthScreen({
  initialMode = 'login',
  initialResetCode = '',
  initialVerifyToken = '',
  initialVerifyEmail = '',
  notice,
  oauthChallenge,
  onBack,
  onResetComplete,
  onSuccess,
}) {
  const { t, i18n } = useTranslation();
  const { settings: siteSettings } = usePublicSiteSettings();
  const brand = siteSettings.brand;
  const brandName = brand.name || 'Kendy Digital';
  const brandLogo = brand.logoUrl || heroImg;
  const isEn = i18n.language?.startsWith('en');
  const heroSubtitle = isEn ? t('auth.heroSubtitle') : (brand.tagline || t('auth.heroSubtitle'));
  const heroDescription = isEn ? t('auth.heroDescription') : (brand.description || t('auth.heroDescription'));
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    remember: true,
    twoFactorCode: '',
  });
  const [twoFactorStep, setTwoFactorStep] = useState(() => (
    oauthChallenge ? {
      challengeToken: oauthChallenge.challengeToken,
      email: oauthChallenge.email,
      provider: oauthChallenge.provider,
      type: 'oauth',
    } : null
  ));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [oauthProviders, setOauthProviders] = useState(defaultOAuthProviders);
  const [verifyEmail, setVerifyEmail] = useState(initialVerifyEmail);
  const [verifyToken, setVerifyToken] = useState(initialVerifyToken);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState(initialResetCode);
  const [resetToken, setResetToken] = useState('');
  const { addToast, clearToasts } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    authApi.getProviders()
      .then((data) => {
        if (isMounted && Array.isArray(data?.providers) && data.providers.length > 0) {
          setOauthProviders(data.providers);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOauthProviders(defaultOAuthProviders);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const switchMode = (target) => {
    setMode((current) => target || (current === 'login' ? 'register' : 'login'));
    setTwoFactorStep(null);
    setResetToken('');
    setResetCode('');
    setResetEmail('');
    setError('');
    setCaptchaRequired(false);
    setCaptchaToken('');
  };

  const startOAuthLogin = (provider) => {
    addToast({
      type: 'info',
      title: t('auth.loginWith', { provider: provider.name }),
      message: t('auth.oauthRedirect'),
    });
    window.location.assign(toApiUrl(provider.authorizationUrl));
  };

  // Validation functions
  const validateEmail = composeValidators(isRequired, isValidEmail);
  const validatePassword = composeValidators(isRequired, minLength(8));
  const validateConfirmPassword = (value) => {
    if (!isRequired(value)) return { isValid: false, error: t('auth.error.confirmPasswordRequired') };
    if (!isMatching(value, form.password)) return { isValid: false, error: t('auth.error.passwordMismatch') };
    return { isValid: true };
  };
  const validateName = composeValidators(isRequired);
  const validateTwoFactorCode = composeValidators(isRequired, minLength(6));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    clearToasts('error');

    if (twoFactorStep?.type === 'oauth') {
      if (!isRequired(form.twoFactorCode)) {
        setError(t('auth.error.enter2FACode'));
        return;
      }

      setBusy(true);
      let response;
      try {
        response = await authApi.verifyOAuthTwoFactor({
          challengeToken: twoFactorStep.challengeToken,
          code: form.twoFactorCode.trim(),
        });
      } catch (err) {
        const msg = err.message || t('auth.error.twoFactorFailed');
        setError(msg);
        addToast({ type: 'error', title: t('auth.toast.authFailed'), message: msg });
        return;
      } finally {
        setBusy(false);
      }

      if (response) {
        clearToasts();
        addToast({ type: 'success', title: t('auth.toast.loginTitle'), message: t('auth.success.twoFactor') });
        onSuccess(response, form.remember);
      }
      return;
    }

    if (mode === 'verify') {
      if (!verifyToken) {
        setError(t('auth.error.enterVerifyCode'));
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterVerifyCode') });
        return;
      }

      setBusy(true);
      try {
        await authApi.verifyEmail({ token: verifyToken });
        addToast({ type: 'success', title: t('auth.toast.verifyTitle'), message: t('auth.success.verify') });
        const verifiedEmail = verifyEmail;
        setMode('login');
        setVerifyToken('');
        setVerifyEmail('');
        setForm((current) => ({ ...current, email: verifiedEmail }));
      } catch (err) {
        const msg = (err.code && t(`errorCodes.${err.code}`)) || err.message || t('auth.error.invalidVerifyCode');
        setError(msg);
        addToast({ type: 'error', title: t('common.error'), message: msg });
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'forgot') {
      const emailValidation = validateEmail(form.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || t('auth.error.enterEmail'));
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterEmail') });
        return;
      }

      setBusy(true);
      try {
        const email = form.email.trim();
        await authApi.forgotPassword({ email });
        setResetEmail(email);
        setResetCode('');
        setResetToken('');
        setMode('reset-verify');
        addToast({ type: 'success', title: t('auth.toast.forgotTitle'), message: t('auth.success.forgot') });
      } catch (err) {
        const msg = err.message || t('auth.error.forgotFailed');
        setError(msg);
        addToast({ type: 'error', title: t('common.error'), message: msg });
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'reset-verify') {
      if (!isRequired(resetCode)) {
        setError(t('auth.error.enterResetCode'));
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterResetCode') });
        return;
      }

      setBusy(true);
      try {
        const result = await authApi.verifyPasswordReset({ token: resetCode.trim() });
        setResetToken(result.token || result.securityToken);
        setMode('reset');
        addToast({ type: 'success', title: t('auth.toast.resetTitle'), message: t('auth.success.resetCode') });
      } catch (err) {
        const msg = err.message || t('auth.error.invalidResetCode');
        setError(msg);
        addToast({ type: 'error', title: t('common.error'), message: msg });
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'reset') {
      if (!resetToken) {
        setError(t('auth.error.enterResetCode'));
        setMode('reset-verify');
        return;
      }

      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || t('auth.error.enterNewPassword'));
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterNewPassword') });
        return;
      }

      if (!isMatching(form.password, form.confirmPassword)) {
        setError(t('auth.error.passwordMismatch'));
        addToast({ type: 'error', title: t('common.error'), message: t('auth.error.passwordMismatch') });
        return;
      }

      setBusy(true);
      try {
        await authApi.resetPassword({ token: resetToken, newPassword: form.password });
        addToast({ type: 'success', title: t('auth.toast.resetTitle'), message: t('auth.success.reset') });
        setMode('login');
        setResetToken('');
        setResetCode('');
        setResetEmail('');
        setForm((current) => ({
          ...current,
          password: '',
          confirmPassword: '',
        }));
        onResetComplete?.();
      } catch (err) {
        const msg = err.message || t('auth.error.resetFailed');
        setError(msg);
        addToast({ type: 'error', title: t('auth.toast.resetFailed'), message: msg });
      } finally {
        setBusy(false);
      }
      return;
    }

    // Login and Register validation
    if (!isRequired(form.email) || !isRequired(form.password)) {
      setError(t('auth.error.enterEmailPassword'));
      addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterEmailPassword') });
      return;
    }

    if (!isValidEmail(form.email)) {
      const msg = t('validation.email');
      setError(msg);
      addToast({ type: 'error', title: t('common.error'), message: msg });
      return;
    }

    if (mode === 'register' && !isRequired(form.name)) {
      setError(t('auth.error.enterName'));
      addToast({ type: 'error', title: t('common.error'), message: t('auth.error.enterName') });
      return;
    }

    if (mode === 'register' && isRequired(form.phone) && !isValidPhoneVn(form.phone)) {
      const msg = t('validation.phone');
      setError(msg);
      addToast({ type: 'error', title: t('common.error'), message: msg });
      return;
    }

    if (mode === 'register' && !minLength(form.password, 8)) {
      setError(t('auth.error.passwordMinLength'));
      addToast({ type: 'error', title: t('common.error'), message: t('auth.error.passwordMinLength') });
      return;
    }

    if (mode === 'register' && !isRequired(form.confirmPassword)) {
      const msg = t('auth.error.confirmPasswordRequired');
      setError(msg);
      addToast({ type: 'error', title: t('common.error'), message: msg });
      return;
    }

    if (mode === 'register' && !isMatching(form.password, form.confirmPassword)) {
      const msg = t('auth.error.passwordMismatch');
      setError(msg);
      addToast({ type: 'error', title: t('common.error'), message: msg });
      return;
    }

    if (captchaRequired && TURNSTILE_SITE_KEY && !captchaToken) {
      const msg = t('auth.error.captchaRequired', { defaultValue: 'Vui lòng hoàn tất xác minh bảo mật.' });
      setError(msg);
      addToast({ type: 'error', title: t('common.error'), message: msg });
      return;
    }

    if (mode === 'register') {
      setBusy(true);
      try {
        const registeredEmail = form.email.trim();
        await authApi.register({
          name: form.name.trim(),
          email: registeredEmail,
          phone: form.phone,
          password: form.password,
        }, captchaToken);
        clearToasts();
        addToast({ type: 'success', title: t('auth.toast.registerTitle'), message: t('auth.success.register') });
        setVerifyEmail(registeredEmail);
        setMode('verify');
        setForm((current) => ({
          ...current,
          email: registeredEmail,
          password: '',
          confirmPassword: '',
        }));
      } catch (err) {
        if (String(err.message || '').includes('CAPTCHA_REQUIRED')) {
          setCaptchaRequired(true);
          setCaptchaToken('');
          setCaptchaRefreshKey((value) => value + 1);
          setError('');
          clearToasts('error');
          addToast({
            type: 'info',
            title: t('auth.toast.securityTitle', { defaultValue: 'Xác minh bảo mật' }),
            message: t('auth.error.captchaRequired', { defaultValue: 'Vui lòng hoàn tất xác minh bảo mật.' }),
          });
          return;
        }
        const msg = err.message || t('auth.error.registerFailed');
        setError(msg);
        addToast({
          type: 'error',
          title: t('auth.toast.registerFailed'),
          message: msg,
        });
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    let loginResponse;
    try {
      loginResponse = await authApi.login({
        email: form.email.trim(),
        password: form.password,
        twoFactorCode: twoFactorStep?.type === 'password' ? form.twoFactorCode.trim() : undefined,
      }, captchaToken);
    } catch (err) {
      if (String(err.message || '').includes('CAPTCHA_REQUIRED')) {
        setCaptchaRequired(true);
        setCaptchaToken('');
        setCaptchaRefreshKey((value) => value + 1);
        setError('');
        clearToasts('error');
        addToast({
          type: 'info',
          title: t('auth.toast.securityTitle', { defaultValue: 'Xác minh bảo mật' }),
          message: t('auth.error.captchaRequired', { defaultValue: 'Vui lòng hoàn tất xác minh bảo mật.' }),
        });
        return;
      }

      if (String(err.message || '').includes('2FA code required')) {
        setTwoFactorStep({ email: form.email.trim(), type: 'password' });
        updateForm('twoFactorCode', '');
        setError('');
        clearToasts('error');
        addToast({ type: 'info', title: t('auth.toast.twoFactorTitle'), message: t('auth.toast.twoFactorInfo') });
        return;
      }

      if (String(err.message || '').includes('EMAIL_NOT_VERIFIED')) {
        const loginEmail = form.email.trim();
        setVerifyEmail(loginEmail);
        setMode('verify');
        setError('');
        clearToasts('error');
        addToast({
          type: 'info',
          title: t('auth.toast.verifyTitle'),
          message: t('auth.emailNotVerifiedInfo', { defaultValue: 'Tài khoản chưa xác minh email. Mã xác minh đã được gửi lại.' }),
        });
        return;
      }

      const msg = err.message || t('auth.error.loginFailed');
      setError(msg);
      addToast({
        type: 'error',
        title: t('auth.toast.loginFailed'),
        message: msg,
      });
      return;
    } finally {
      setBusy(false);
    }

    if (loginResponse) {
      clearToasts();
      addToast({ type: 'success', title: t('auth.toast.loginTitle'), message: t('auth.success.login') });
      onSuccess(loginResponse, form.remember);
    }
  };

  return (
    <section className="auth-screen">
      <aside className="auth-brand-panel" aria-label={brandName}>
        <div className="pixel-layer" aria-hidden="true" />
        <div className="auth-brand-content">
          <div className="auth-logo-lockup">
            <img src={brandLogo} alt={brandName} />
            <div>
              <strong>{brandName}</strong>
              <span>{heroSubtitle}</span>
            </div>
          </div>

          <div className="auth-hero-copy">
            <span className="auth-kicker">
              <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
              {t('auth.heroKicker')}
            </span>
            <h1>{brandName}</h1>
            <p>{heroDescription}</p>
          </div>

          <div className="auth-highlight-list">
            {authHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article className="auth-highlight" key={item.titleKey}>
                  <Icon size={22} strokeWidth={2} aria-hidden="true" />
                  <div>
                    <strong>{t(item.titleKey)}</strong>
                    <span>{t(item.textKey)}</span>
                  </div>
                </article>
              );
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
              {mode === 'verify' || mode === 'reset-verify' ? <ShieldCheck size={22} strokeWidth={2} /> :
               mode === 'forgot' ? <Mail size={22} strokeWidth={2} /> :
               mode === 'reset' ? <KeyRound size={22} strokeWidth={2} /> :
               mode === 'register' ? <UserRound size={22} strokeWidth={2} /> : <LogIn size={22} strokeWidth={2} />}
            </span>
            <div>
              <span className="eyebrow">
                {twoFactorStep ? t('auth.twoFactorEyebrow') :
                 mode === 'verify' ? t('auth.verifyEyebrow') :
                 mode === 'reset-verify' ? t('auth.resetVerifyEyebrow') :
                 mode === 'forgot' ? t('auth.forgotEyebrow') :
                 mode === 'reset' ? t('auth.resetEyebrow') :
                 mode === 'register' ? t('auth.registerEyebrow') : t('auth.loginEyebrow')}
              </span>
              <h2>
                {twoFactorStep
                  ? t('auth.twoFactorTitle')
                  : mode === 'verify' ? t('auth.verifyTitle')
                  : mode === 'reset-verify' ? t('auth.resetVerifyTitle')
                  : mode === 'forgot' ? t('auth.forgotTitle')
                  : mode === 'reset' ? t('auth.resetTitle')
                  : mode === 'register'
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

            {mode === 'verify' && (
              <>
                <p className="auth-message">
                  {verifyEmail ? (
                    <>{t('auth.verifyCodeSent')} <strong>{verifyEmail}</strong>.</>
                  ) : t('auth.verifyCodeFromEmail', { defaultValue: 'Nhập mã xác thực trong email của bạn.' })}
                </p>
                <BaseInput
                  label={t('auth.verifyCodeLabel')}
                  value={verifyToken}
                  onChange={(value) => setVerifyToken(value.trim())}
                  validators={[isRequired]}
                  errorMessage={t('auth.error.enterVerifyCode')}
                  placeholder="123456"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={64}
                />
                {verifyEmail && (
                  <button
                    type="button"
                    className="text-action"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError('');
                      try {
                        await authApi.resendVerification({ email: verifyEmail });
                        addToast({ type: 'success', title: t('auth.toast.verifyTitle'), message: t('auth.success.resend') });
                      } catch (err) {
                        const msg = (err.code && t(`errorCodes.${err.code}`)) || err.message || t('auth.error.resendFailed');
                        setError(msg);
                        addToast({ type: 'error', title: t('common.error'), message: msg });
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {t('auth.resendCode')}
                  </button>
                )}
              </>
            )}

            {mode === 'forgot' && (
              <BaseInput
                label={t('auth.emailLabel')}
                value={form.email}
                onChange={(value) => updateForm('email', value)}
                validators={[validateEmail]}
                errorMessage={t('auth.error.enterEmail')}
                placeholder={t('auth.emailPlaceholder')}
                type="email"
                autoComplete="email"
              />
            )}

            {mode === 'reset-verify' && (
              <>
                <p className="auth-message">
                  {resetEmail ? (
                    <>{t('auth.resetCodeSent')} <strong>{resetEmail}</strong>.</>
                  ) : t('auth.resetCodeFromEmail')}
                </p>
                <BaseInput
                  label={t('auth.verifyCodeLabel')}
                  value={resetCode}
                  onChange={(value) => setResetCode(value.replace(/\D/g, '').slice(0, 6))}
                  validators={[isRequired]}
                  errorMessage={t('auth.error.enterResetCode')}
                  placeholder={t('auth.verifyPastePlaceholder')}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </>
            )}

            {mode === 'reset' && (
              <>
                <BaseInput
                  label={t('auth.newPasswordLabel')}
                  value={form.password}
                  onChange={(value) => updateForm('password', value)}
                  validators={[validatePassword]}
                  errorMessage={t('auth.error.enterNewPassword')}
                  placeholder={t('auth.minCharsPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                >
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </BaseInput>
                <BaseInput
                  label={t('auth.confirmNewPasswordLabel')}
                  value={form.confirmPassword}
                  onChange={(value) => updateForm('confirmPassword', value)}
                  validators={[validateConfirmPassword]}
                  errorMessage={t('auth.error.confirmPasswordRequired', { defaultValue: 'Vui lòng xác nhận lại mật khẩu.' })}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                >
                  {form.confirmPassword.length > 0 && (
                    form.confirmPassword === form.password
                    ? <CheckCircle2 size={18} strokeWidth={2} className="confirm-icon match" aria-label={t('auth.match')} />
                    : <span className="confirm-icon mismatch" aria-label={t('auth.mismatch')}>✕</span>
                  )}
                </BaseInput>
              </>
            )}

            {!twoFactorStep && mode !== 'forgot' && mode !== 'reset-verify' && mode !== 'reset' && mode !== 'verify' && (
              <BaseInput
                label={t('auth.emailLabel')}
                value={form.email}
                onChange={(value) => updateForm('email', value)}
                validators={[validateEmail]}
                errorMessage={t('auth.error.enterEmail')}
                placeholder={t('auth.emailPlaceholder')}
                type="email"
                autoComplete="email"
              />
            )}

            {mode === 'register' && !twoFactorStep && (
              <BaseInput
                label={t('auth.nameLabel')}
                value={form.name}
                onChange={(value) => updateForm('name', value)}
                validators={[validateName]}
                errorMessage={t('auth.error.enterName')}
                placeholder={t('auth.namePlaceholder')}
                autoComplete="name"
              />
            )}

            {mode === 'register' && !twoFactorStep && (
              <BaseInput
                label={t('auth.phoneLabel')}
                value={form.phone}
                onChange={(value) => updateForm('phone', value)}
                validators={[validatePhoneVn]}
                errorMessage={t('validation.phone')}
                placeholder={t('auth.phonePlaceholder')}
                maxLength={11}
                inputMode="tel"
                autoComplete="tel"
              />
            )}

            {!twoFactorStep && mode !== 'forgot' && mode !== 'reset-verify' && mode !== 'reset' && mode !== 'verify' && (
              <BaseInput
                label={t('auth.passwordLabel')}
                value={form.password}
                onChange={(value) => updateForm('password', value)}
                validators={[validatePassword]}
                errorMessage={t('auth.error.enterPassword', { defaultValue: 'Vui lòng nhập mật khẩu.' })}
                placeholder={t('auth.passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              >
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </BaseInput>
            )}

            {twoFactorStep && (
              <BaseInput
                label={t('auth.twoFactorCodeLabel')}
                value={form.twoFactorCode}
                onChange={(value) => updateForm('twoFactorCode', value.replace(/\D/g, '').slice(0, 6))}
                validators={[validateTwoFactorCode]}
                errorMessage={t('auth.error.enter2FACode', { defaultValue: 'Vui lòng nhập mã xác thực.' })}
                placeholder={t('auth.twoFactorPlaceholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            )}

            {mode === 'register' && !twoFactorStep && (
              <BaseInput
                label={t('auth.confirmPasswordLabel')}
                value={form.confirmPassword}
                onChange={(value) => updateForm('confirmPassword', value)}
                validators={[validateConfirmPassword]}
                errorMessage={t('auth.error.passwordMismatch', { defaultValue: 'Mật khẩu xác nhận chưa khớp.' })}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
              >
                {form.confirmPassword.length > 0 && (
                  form.confirmPassword === form.password
                  ? <CheckCircle2 size={18} strokeWidth={2} className="confirm-icon match" aria-label={t('auth.match')} />
                  : <span className="confirm-icon mismatch" aria-label={t('auth.mismatch')}>✕</span>
                )}
              </BaseInput>
            )}
          </div>

          {mode !== 'register' && !twoFactorStep && mode !== 'forgot' && mode !== 'reset' && mode !== 'verify' && (
            <div className="auth-options">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => updateForm('remember', e.target.checked)}
                />
                <span>{t('auth.rememberLogin')}</span>
              </label>
              <button type="button" className="text-action" onClick={() => switchMode('forgot')}>
                <KeyRound size={16} strokeWidth={2} aria-hidden="true" />
                {t('auth.forgotPasswordLink')}
              </button>
            </div>
          )}

          {(error || notice) && <p className={error ? 'auth-message error' : 'auth-message'}>{error || notice}</p>}

          {captchaRequired && TURNSTILE_SITE_KEY && (
            <div className="auth-captcha">
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                theme={theme === 'dark' ? 'dark' : 'light'}
                refreshKey={captchaRefreshKey}
                onToken={setCaptchaToken}
              />
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={busy || (captchaRequired && TURNSTILE_SITE_KEY && !captchaToken)}>
            {busy ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <>
                <span>
                  {twoFactorStep ? t('auth.submitConfirmCode') :
                   mode === 'verify' ? t('auth.submitVerify') :
                   mode === 'reset-verify' ? t('auth.submitResetVerify') :
                   mode === 'forgot' ? t('auth.submitForgot') :
                   mode === 'reset' ? t('auth.submitReset') :
                   mode === 'register' ? t('auth.submitRegister') : t('auth.submitLogin')}
                </span>
                {mode === 'forgot' ? <Send size={18} strokeWidth={2} aria-hidden="true" /> : <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
              </>
            )}
          </button>

          {!twoFactorStep && mode !== 'forgot' && mode !== 'reset-verify' && mode !== 'reset' && mode !== 'verify' && (
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
              {mode === 'verify' ? (
                <>
                  <span>{t('auth.verifiedEmail')}</span>
                  <button type="button" onClick={() => switchMode('login')}>{t('auth.login')}</button>
                  <span style={{ margin: '0 8px', opacity: 0.4 }}>•</span>
                  <button type="button" onClick={() => switchMode('register')}>{t('auth.registerAgain', { defaultValue: 'Đăng ký lại' })}</button>
                </>
              ) : mode === 'forgot' || mode === 'reset-verify' || mode === 'reset' ? (
                <>
                  <span>{t('auth.rememberPassword')}</span>
                  <button type="button" onClick={() => switchMode('login')}>{t('auth.login')}</button>
                </>
              ) : (
                <>
                  {mode === 'register' ? t('auth.hasAccount') : t('auth.noAccount')}
                  <button type="button" onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}>
                    {mode === 'register' ? t('auth.login') : t('auth.signUpNow')}
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

export default AuthScreen;