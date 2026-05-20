import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import useThemeStore from '../store/themeStore'
import api from '../services/api'
import PageTransition from '../components/ui/PageTransition'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || ''
  })

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/api/users/me/profile', data)
      return res.data.data
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['me'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['profile', updatedUser.username] })
      toast.success('Profile updated successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    }
  })

  // Avatar Upload Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/api/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user)
      toast.success('Avatar updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to upload avatar')
    }
  })

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout')
    },
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      navigate('/login')
      toast.success('Logged out successfully')
    }
  })

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadAvatarMutation.mutate(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto pb-32 pt-6 px-4">
        <h2 className="text-2xl font-heading font-bold text-primary mb-8">Settings</h2>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10 pb-10 border-b border-border">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar src={user?.avatarUrl} username={user?.username} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <p className="mt-4 text-accent font-medium cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
            Change profile photo
          </p>
          {uploadAvatarMutation.isPending && <p className="text-sm text-secondary mt-2">Uploading...</p>}
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-10 pb-10 border-b border-border">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">Edit Profile</h3>
          
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Name</label>
            <input 
              type="text" 
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-input border border-border rounded-btn py-3 px-4 text-primary focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full bg-input border border-border rounded-btn py-3 px-4 text-primary focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full bg-input border border-border rounded-btn py-3 px-4 text-primary focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Website</label>
            <input 
              type="url" 
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              placeholder="https://"
              className="w-full bg-input border border-border rounded-btn py-3 px-4 text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>

        {/* Appearance & Account */}
        <div className="space-y-6">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">Appearance</h3>
          
          <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-card">
            <div>
              <p className="font-heading font-bold text-primary">Dark Mode</p>
              <p className="text-sm text-secondary">Switch between dark and light themes</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <h3 className="text-xl font-heading font-bold text-primary mt-10 mb-4 text-red-500">Account</h3>
          
          <button 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full py-4 bg-surface border border-border rounded-card font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left px-6"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
          </button>
        </div>

      </div>
    </PageTransition>
  )
}
