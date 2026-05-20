import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api, getApiErrorMessage, getResponseData } from '@/services/api'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { debounce } from '@/utils/formatters'
import toast from 'react-hot-toast'

const STEPS = ['Account', 'Profile', 'Done']

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            background: i <= current ? 'var(--accent)' : 'var(--border)',
          }}
          transition={{ duration: 0.3 }}
          style={{ height: 8, borderRadius: 999 }}
        />
      ))}
    </div>
  )
}

function FormInput({ label, type = 'text', value, onChange, placeholder, error, hint, autoComplete }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input-base"
        style={error ? { borderColor: '#ef4444' } : hint?.type === 'success' ? { borderColor: '#10b981' } : {}}
      />
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
      {hint && !error && <p style={{ color: hint.type === 'success' ? '#10b981' : 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{hint.text}</p>}
    </div>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState(null) // 'checking' | 'available' | 'taken'

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    username: '',
  })
  const [errors, setErrors] = useState({})

  // Debounced username check
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (!username || username.length < 3) return
      setUsernameStatus('checking')
      try {
        await api.get(`/auth/check-username?username=${username}`)
        setUsernameStatus('available')
      } catch {
        setUsernameStatus('taken')
      }
    }, 500),
    []
  )

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (field === 'username') checkUsername(e.target.value)
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const validateStep0 = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'At least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const validateStep1 = () => {
    const errs = {}
    if (!form.displayName.trim()) errs.displayName = 'Display name is required'
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) errs.username = '3-20 chars, letters/numbers/underscore only'
    else if (usernameStatus === 'taken') errs.username = 'Username is already taken'
    return errs
  }

  const handleNext = () => {
    const errs = step === 0 ? validateStep0() : {}
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    const errs = validateStep1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setIsLoading(true)

    try {
      const res = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        username: form.username.toLowerCase(),
      })
      const { user, accessToken } = getResponseData(res)
      setAuth(user, accessToken)
      setStep(2)
      setTimeout(() => {
        toast.success('Welcome to NOX! 🎉')
        navigate('/feed')
      }, 1800)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registration failed')
      setErrors({ general: msg })
      setStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  const usernameHint = usernameStatus === 'checking'
    ? { type: 'info', text: 'Checking availability…' }
    : usernameStatus === 'available'
    ? { type: 'success', text: 'Username is available ✓' }
    : usernameStatus === 'taken'
    ? null // shown as error
    : null

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-void)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(ellipse, rgba(236,72,153,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass"
        style={{ width: '100%', maxWidth: 420, borderRadius: 20, padding: '40px 32px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/">
            <div
              className="font-display"
              style={{
                fontSize: 44,
                letterSpacing: 6,
                background: 'linear-gradient(135deg, var(--text-primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              NOX
            </div>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
            {step === 2 ? 'Welcome aboard! 🎉' : 'Create your account'}
          </p>
        </div>

        {step < 2 && <StepIndicator current={step} total={2} />}

        <AnimatePresence mode="wait">
          {/* Step 0: Account */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {errors.general && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 14 }}>
                    {errors.general}
                  </div>
                )}
                <FormInput label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" error={errors.email} autoComplete="email" />
                <FormInput label="Password" type="password" value={form.password} onChange={update('password')} placeholder="At least 8 characters" error={errors.password} autoComplete="new-password" />
                <FormInput label="Confirm password" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••••" error={errors.confirmPassword} autoComplete="new-password" />
                <Button variant="primary" size="lg" fullWidth onClick={handleNext} className="mt-2">
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {errors.general && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 14 }}>
                    {errors.general}
                  </div>
                )}
                <FormInput label="Display name" value={form.displayName} onChange={update('displayName')} placeholder="Your name" error={errors.displayName} autoComplete="name" />
                <FormInput
                  label="Username"
                  value={form.username}
                  onChange={update('username')}
                  placeholder="yourhandle"
                  error={usernameStatus === 'taken' ? 'Username is already taken' : errors.username}
                  hint={usernameHint}
                  autoComplete="username"
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="ghost" size="lg" onClick={() => setStep(0)} className="flex-1">
                    Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleSubmit} loading={isLoading} className="flex-1">
                    Join NOX
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Success */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{ textAlign: 'center', padding: '16px 0' }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ fontSize: 56, marginBottom: 16 }}
              >
                🎉
              </motion.div>
              <h3 className="font-heading font-bold" style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
                You're in!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                Redirecting to your feed…
              </p>
              <div className="spinner" style={{ margin: '20px auto 0', width: 24, height: 24 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {step < 2 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginTop: 20, fontFamily: 'Inter, sans-serif' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}

export default RegisterPage
