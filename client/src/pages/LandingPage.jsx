import { useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import ThemeToggle from '@/components/ui/ThemeToggle'

// Mock post card for the hero illustration
function MockPostCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotate: 3 }}
      animate={{ opacity: 1, x: 0, rotate: 2 }}
      transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: 300,
        background: 'rgba(17,17,17,0.9)',
        borderRadius: 20,
        border: '1px solid #222',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.2)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          }}
        />
        <div>
          <div style={{ width: 80, height: 10, background: '#333', borderRadius: 4, marginBottom: 5 }} />
          <div style={{ width: 56, height: 8, background: '#222', borderRadius: 4 }} />
        </div>
      </div>
      {/* Fake image */}
      <div
        style={{
          height: 180,
          background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #0f0a1e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.3)',
              border: '1px solid rgba(139,92,246,0.5)',
              margin: '0 auto 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.8)" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        </div>
      </div>
      {/* Caption */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ width: '80%', height: 8, background: '#2a2a2a', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: '60%', height: 8, background: '#1e1e1e', borderRadius: 4 }} />
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, padding: '8px 14px 14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ec4899" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div style={{ width: 24, height: 8, background: '#333', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <div style={{ width: 20, height: 8, background: '#2a2a2a', borderRadius: 4 }} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#8b5cf6" stroke="none">
            <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const word1Ref = useRef(null)
  const word2Ref = useRef(null)
  const word3Ref = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl.fromTo(
        word1Ref.current,
        { y: 80, opacity: 0, skewY: 4 },
        { y: 0, opacity: 1, skewY: 0, duration: 0.8, delay: 0.2 }
      )
        .fromTo(
          word2Ref.current,
          { y: 80, opacity: 0, skewY: 4 },
          { y: 0, opacity: 1, skewY: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          word3Ref.current,
          { y: 80, opacity: 0, skewY: 4 },
          { y: 0, opacity: 1, skewY: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3'
        )
        .fromTo(
          ctaRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.2'
        )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={heroRef}
      style={{
        minHeight: '100vh',
        background: '#080808',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '60%',
          height: '70%',
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '40%',
          height: '50%',
          background: 'radial-gradient(ellipse at center, rgba(236,72,153,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl"
          style={{
            letterSpacing: 4,
            background: 'linear-gradient(135deg, #f2f2f2, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NOX
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <ThemeToggle />
          <Link to="/login">
            <button className="btn-ghost" style={{ fontSize: 14 }}>
              Sign in
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-primary" style={{ fontSize: 14 }}>
              Join NOX
            </button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero section */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 24px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left: text */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 999,
              padding: '6px 14px',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#8b5cf6',
                animation: 'storyPulse 2s infinite',
              }}
            />
            <span
              style={{
                color: '#c4b5fd',
                fontSize: 13,
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 500,
              }}
            >
              Next-gen social platform
            </span>
          </motion.div>

          {/* Headline */}
          <div style={{ overflow: 'hidden', marginBottom: 8 }}>
            <div
              ref={word1Ref}
              className="font-display"
              style={{
                fontSize: 'clamp(60px, 10vw, 100px)',
                lineHeight: 0.95,
                color: '#f2f2f2',
                letterSpacing: 2,
              }}
            >
              CONNECT.
            </div>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 8 }}>
            <div
              ref={word2Ref}
              className="font-display"
              style={{
                fontSize: 'clamp(60px, 10vw, 100px)',
                lineHeight: 0.95,
                color: '#f2f2f2',
                letterSpacing: 2,
              }}
            >
              CREATE.
            </div>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 40 }}>
            <div
              ref={word3Ref}
              className="font-display"
              style={{
                fontSize: 'clamp(60px, 10vw, 100px)',
                lineHeight: 0.95,
                letterSpacing: 2,
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NOX.
            </div>
          </div>

          {/* Subtitle */}
          <div ref={subtitleRef}>
            <p
              style={{
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                color: '#9a9a9a',
                lineHeight: 1.6,
                marginBottom: 40,
                maxWidth: 420,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              The platform for the next generation. Share your world, build your audience, and connect with creators who inspire you.
            </p>
          </div>

          {/* CTA */}
          <div ref={ctaRef} className="flex gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="btn-primary"
              style={{
                fontSize: 16,
                padding: '14px 32px',
                boxShadow: '0 0 40px rgba(139,92,246,0.4)',
              }}
            >
              Get started — it's free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="btn-ghost"
              style={{
                fontSize: 16,
                padding: '14px 28px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            >
              Sign in
            </motion.button>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            {/* Stacked avatars */}
            <div style={{ display: 'flex' }}>
              {['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid #080808',
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: 4 - i,
                  }}
                />
              ))}
            </div>
            <span style={{ color: '#555', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              Join <span style={{ color: '#9a9a9a', fontWeight: 600 }}>10,000+</span> creators
            </span>
          </motion.div>
        </div>

        {/* Right: mock UI (desktop only) */}
        <div
          className="hidden lg:flex"
          style={{
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <MockPostCard />

          {/* Floating stats badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            style={{
              position: 'absolute',
              bottom: -16,
              left: -40,
              background: 'rgba(17,17,17,0.9)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 12,
              padding: '10px 16px',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(236,72,153,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ec4899">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <div style={{ color: '#f2f2f2', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15 }}>
                2.4K
              </div>
              <div style={{ color: '#555', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                likes today
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '32px 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '⚡', text: 'Real-time feed' },
            { icon: '🎨', text: 'Beautiful stories' },
            { icon: '🔍', text: 'Smart explore' },
            { icon: '🔔', text: 'Live notifications' },
            { icon: '🌙', text: 'Dark & light modes' },
          ].map((f) => (
            <div
              key={f.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#555',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default LandingPage
