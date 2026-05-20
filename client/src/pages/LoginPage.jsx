import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/services/api'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import toast from 'react-hot-toast'

function FormInput({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 13,
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
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
        style={{
          ...(error ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}),
        }}
      />
      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setIsLoading(true)

    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })
      setAuth(res.data.user, res.data.accessToken)
      toast.success(`Welcome back, ${res.data.user.displayName || res.data.user.username}!`)
      navigate('/feed')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid email or password'
      setErrors({ general: msg })
    } finally {
      setIsLoading(false)
    }
  }

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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Theme toggle - top right */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 20,
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <div
              className="font-display"
              style={{
                fontSize: 52,
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
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
            Welcome back
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {errors.general}
              </motion.div>
            )}

            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
            />

            <FormInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              fullWidth
              className="mt-2"
            >
              Sign in
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '24px 0',
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            Join NOX
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
