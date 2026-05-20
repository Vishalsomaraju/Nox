import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { api } from '@/services/api'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const MAX_CHARS = 2000

function CreatePostModal({ isOpen, onClose }) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const charsLeft = MAX_CHARS - content.length
  const canSubmit = (content.trim() || imageFile) && !isSubmitting && charsLeft >= 0

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageSelect(file)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (content.trim()) formData.append('content', content.trim())
      if (imageFile) formData.append('image', imageFile)

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Post published!')
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      handleClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setContent('')
    setImageFile(null)
    setImagePreview(null)
    setIsDragging(false)
    onClose?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Post" maxWidth="540px">
      <div className="flex gap-3 mb-4">
        {/* Author avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--story-ring-start), var(--story-ring-end))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {(user?.displayName || user?.username || '?')[0].toUpperCase()}
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.displayName || user?.username}?`}
          maxLength={MAX_CHARS}
          rows={4}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Image drop zone */}
      <AnimatePresence>
        {imagePreview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: 16,
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'var(--accent-subtle)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Drop an image here or <span style={{ color: 'var(--accent)' }}>click to browse</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleImageSelect(e.target.files[0])}
      />

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div className="flex items-center justify-between">
          {/* Char counter */}
          <span
            style={{
              fontSize: 13,
              color: charsLeft < 100 ? (charsLeft < 0 ? '#ef4444' : '#f59e0b') : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {charsLeft} characters left
          </span>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!canSubmit}
            >
              Publish
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreatePostModal
