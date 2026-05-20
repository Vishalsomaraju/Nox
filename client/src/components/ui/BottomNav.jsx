import { useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import useNotificationStore from '@/store/notificationStore'
import { useNavigate, useLocation } from 'react-router-dom'
import CreatePostModal from '@/components/feed/CreatePostModal'

const HomeIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const CompassIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={filled ? 'currentColor' : 'none'} />
  </svg>
)

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const BellIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const UserIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

// Desktop sidebar icons
function SidebarLink({ icon, label, active, onClick, badge }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-btn transition-colors text-left"
      style={{
        background: active ? 'var(--accent-subtle)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <span style={{ position: 'relative' }}>
        {icon}
        {badge > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#ef4444',
              color: 'white',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span className="font-heading font-medium text-sm">{label}</span>
    </motion.button>
  )
}

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const path = location.pathname
  const username = user?.username || ''

  const navItems = [
    { key: 'feed', label: 'Home', path: '/feed', Icon: HomeIcon },
    { key: 'explore', label: 'Explore', path: '/explore', Icon: CompassIcon },
    { key: 'create', label: 'Create', path: null, Icon: PlusIcon, action: () => setShowCreateModal(true) },
    { key: 'notifications', label: 'Alerts', path: '/notifications', Icon: BellIcon, badge: unreadCount },
    { key: 'profile', label: 'Profile', path: `/profile/${username}`, Icon: UserIcon },
  ]

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="bottom-nav md:hidden">
        {navItems.map((item) => {
          const isActive = item.path ? path === item.path || path.startsWith(item.path) : false
          const isCreate = item.key === 'create'

          return (
            <motion.button
              key={item.key}
              onClick={() => {
                if (item.action) {
                  item.action()
                } else if (item.path) {
                  navigate(item.path)
                }
              }}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isCreate ? 44 : 40,
                height: isCreate ? 44 : 40,
                borderRadius: isCreate ? 12 : '50%',
                background: isCreate
                  ? 'var(--accent)'
                  : isActive
                  ? 'var(--accent-subtle)'
                  : 'transparent',
                color: isCreate ? '#fff' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
              }}
              aria-label={item.label}
            >
              <item.Icon filled={isActive} />
              {item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 700,
                    minWidth: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    lineHeight: 1,
                  }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full"
        style={{
          width: 240,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          className="font-display text-3xl gradient-text px-4 mb-8"
          style={{ letterSpacing: 2 }}
        >
          NOX
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = item.path ? path === item.path || path.startsWith(item.path) : false
            return (
              <SidebarLink
                key={item.key}
                icon={<item.Icon filled={isActive} />}
                label={item.label}
                active={isActive}
                badge={item.badge}
                onClick={() => {
                  if (item.action) item.action()
                  else if (item.path) navigate(item.path)
                }}
              />
            )
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-btn"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--story-ring-start), var(--story-ring-end))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {(user.displayName || user.username || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {user.displayName || user.username}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                @{user.username}
              </div>
            </div>
          </div>
        )}
      </aside>

      <CreatePostModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  )
}

export default BottomNav
