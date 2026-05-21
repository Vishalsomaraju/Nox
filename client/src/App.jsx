import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useThemeStore from '@/store/themeStore'
import useAuthStore from '@/store/authStore'
import AuthGuard from '@/components/ui/AuthGuard'
import AppLayout from '@/components/layout/AppLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FeedPage from '@/pages/FeedPage'
import ExplorePage from '@/pages/ExplorePage'
import ChatPage from '@/pages/ChatPage'
import ProfilePage from '@/pages/ProfilePage'
import PostDetailPage from '@/pages/PostDetailPage'
import NotificationsPage from '@/pages/NotificationsPage'
import BookmarksPage from '@/pages/BookmarksPage'
import HashtagPage from '@/pages/HashtagPage'
import SettingsPage from '@/pages/SettingsPage'
import StoryViewer from '@/components/story/StoryViewer'

function App() {
  const theme = useThemeStore((s) => s.theme)
  const initialize = useAuthStore((s) => s.initialize)
  const location = useLocation()

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [theme])

  // Initialize auth on mount (check stored token / session)
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Story viewer (full screen, no nav) */}
        <Route
          path="/story/:username"
          element={
            <AuthGuard>
              <StoryViewer />
            </AuthGuard>
          }
        />

        {/* Protected routes with Layout */}
        <Route element={<AppLayout />}>
          <Route
            path="/feed"
            element={
              <AuthGuard>
                <FeedPage />
              </AuthGuard>
            }
          />
          <Route
            path="/explore"
            element={
              <AuthGuard>
                <ExplorePage />
              </AuthGuard>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthGuard>
                <ChatPage />
              </AuthGuard>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />
          <Route
            path="/post/:id"
            element={
              <AuthGuard>
                <PostDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="/notifications"
            element={
              <AuthGuard>
                <NotificationsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <AuthGuard>
                <BookmarksPage />
              </AuthGuard>
            }
          />
          <Route
            path="/hashtag/:tag"
            element={
              <AuthGuard>
                <HashtagPage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
