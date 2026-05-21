import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import useNotificationStore from '@/store/notificationStore'
import { useNavigate, useLocation } from 'react-router-dom'
import CreatePostModal from '@/components/feed/CreatePostModal'
import Drawer from '@/components/ui/Drawer'
import { 
  Home, 
  Compass, 
  PlusSquare, 
  MessageCircle, 
  Menu, 
  Bell, 
  User, 
  Bookmark, 
  Settings,
  LogOut
} from 'lucide-react'

// Desktop sidebar icon component
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
  const logout = useAuthStore((s) => s.logout)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const path = location.pathname
  const username = user?.username || ''

  // All possible navigation items
  const allNavItems = [
    { key: 'feed', label: 'Home', path: '/feed', icon: <Home size={22} /> },
    { key: 'explore', label: 'Explore', path: '/explore', icon: <Compass size={22} /> },
    { key: 'chat', label: 'Chat', path: '/chat', icon: <MessageCircle size={22} /> },
    { key: 'notifications', label: 'Alerts', path: '/notifications', icon: <Bell size={22} />, badge: unreadCount },
    { key: 'bookmarks', label: 'Bookmarks', path: '/bookmarks', icon: <Bookmark size={22} /> },
    { key: 'profile', label: 'Profile', path: `/profile/${username}`, icon: <User size={22} /> },
    { key: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={22} /> },
  ]

  // Filtered items for Desktop Sidebar (excludes Create, added manually below)
  const desktopItems = allNavItems

  // Mobile Bottom Nav items (5 max)
  const mobileNavItems = [
    { key: 'feed', label: 'Home', path: '/feed', icon: <Home size={22} /> },
    { key: 'explore', label: 'Explore', path: '/explore', icon: <Compass size={22} /> },
    { key: 'create', label: 'Create', action: () => setShowCreateModal(true), icon: <PlusSquare size={22} /> },
    { key: 'chat', label: 'Chat', path: '/chat', icon: <MessageCircle size={22} /> },
    { key: 'menu', label: 'Menu', action: () => setShowMobileMenu(true), icon: <Menu size={22} />, badge: unreadCount },
  ]

  // Mobile Drawer items (the overflow)
  const mobileDrawerItems = [
    { key: 'notifications', label: 'Alerts', path: '/notifications', icon: <Bell size={22} />, badge: unreadCount },
    { key: 'bookmarks', label: 'Bookmarks', path: '/bookmarks', icon: <Bookmark size={22} /> },
    { key: 'profile', label: 'Profile', path: `/profile/${username}`, icon: <User size={22} /> },
    { key: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={22} /> },
  ]

  const handleMobileNavClick = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
      setShowMobileMenu(false)
    }
  }

  const handleLogout = () => {
    setShowMobileMenu(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="bottom-nav md:hidden flex justify-between w-full px-6">
        {mobileNavItems.map((item) => {
          const isActive = item.path ? path === item.path || path.startsWith(item.path) : false
          const isCreate = item.key === 'create'

          return (
            <motion.button
              key={item.key}
              onClick={() => handleMobileNavClick(item)}
              whileTap={{ scale: 0.88 }}
              className="flex items-center justify-center relative flex-shrink-0"
              style={{
                width: isCreate ? 44 : 40,
                height: isCreate ? 44 : 40,
                borderRadius: isCreate ? 12 : '50%',
                background: isCreate ? 'var(--accent)' : isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isCreate ? '#fff' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                border: 'none',
              }}
              aria-label={item.label}
            >
              {item.icon}
              {item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
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

      {/* ─── Mobile Menu Drawer ─── */}
      <Drawer isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} title="Menu">
        <div className="flex flex-col gap-2 pb-6">
          {mobileDrawerItems.map((item) => {
            const isActive = item.path ? path === item.path || path.startsWith(item.path) : false
            return (
              <SidebarLink
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={isActive}
                badge={item.badge}
                onClick={() => handleMobileNavClick(item)}
              />
            )
          })}
          
          <div className="h-px bg-border my-2 mx-4" />
          
          <SidebarLink
            icon={<LogOut size={22} />}
            label="Log out"
            active={false}
            onClick={handleLogout}
          />
        </div>
      </Drawer>

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full overflow-y-auto hide-scrollbar"
        style={{
          width: 240,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div className="font-display text-3xl gradient-text px-4 mb-8" style={{ letterSpacing: 2 }}>
          NOX
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {desktopItems.map((item) => {
            const isActive = item.path ? path === item.path || path.startsWith(item.path) : false
            return (
              <SidebarLink
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={isActive}
                badge={item.badge}
                onClick={() => navigate(item.path)}
              />
            )
          })}

          <div className="mt-4 px-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary w-full py-3"
            >
              <PlusSquare size={18} />
              <span>Create Post</span>
            </button>
          </div>
        </nav>

        {/* User footer */}
        {user && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-btn mt-6 cursor-pointer hover:bg-elevated transition-colors"
            style={{ background: 'var(--bg-elevated)' }}
            onClick={() => navigate(`/profile/${username}`)}
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
