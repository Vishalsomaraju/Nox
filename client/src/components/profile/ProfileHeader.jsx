import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import FollowButton from '@/components/ui/FollowButton'
import { formatCount } from '@/utils/formatters'
import useAuthStore from '@/store/authStore'

function StatPill({ label, value, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 20px',
        cursor: onClick ? 'pointer' : 'default',
        flex: 1,
      }}
    >
      <span
        className="font-heading font-bold"
        style={{ fontSize: 20, color: 'var(--text-primary)' }}
      >
        {formatCount(value)}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>
    </motion.button>
  )
}

function ProfileHeader({ profile, isOwnProfile, onEditClick, onFollowToggle }) {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)

  if (!profile) {
    return (
      <div style={{ padding: '24px 16px' }}>
        <div className="flex gap-4 mb-6">
          <div className="skeleton rounded-full" style={{ width: 96, height: 96, flexShrink: 0 }} />
          <div className="flex-1">
            <div className="skeleton mb-2" style={{ width: '60%', height: 20 }} />
            <div className="skeleton mb-3" style={{ width: '40%', height: 14 }} />
            <div className="skeleton" style={{ width: '80%', height: 14 }} />
          </div>
        </div>
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton flex-1" style={{ height: 56, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px 0' }}>
      {/* Top row: avatar + action button */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <Avatar
          src={profile.avatarUrl}
          size="xl"
          username={profile.username}
          displayName={profile.displayName}
          hasStory={profile.hasActiveStory}
          onClick={() => {
            if (profile.hasActiveStory) navigate(`/story/${profile.username}`)
          }}
          disableHover={!profile.hasActiveStory}
        />

        <div className="flex items-center gap-2 pt-2">
          {isOwnProfile ? (
            <Button variant="outline" size="sm" onClick={onEditClick}>
              Edit Profile
            </Button>
          ) : (
            <>
              <FollowButton
                userId={profile.id}
                isFollowing={profile.isFollowing}
                onToggle={onFollowToggle}
                size="sm"
              />
              <Button variant="ghost" size="sm">
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Name & username */}
      <div className="mb-3">
        <h1
          className="font-heading font-bold"
          style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 2 }}
        >
          {profile.displayName || profile.username}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
          @{profile.username}
        </p>

        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: profile.website ? 6 : 0,
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Website */}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              color: 'var(--accent)',
              textDecoration: 'none',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-2 mb-5">
        <StatPill label="Posts" value={profile._count?.posts ?? profile.postsCount ?? 0} />
        <StatPill
          label="Followers"
          value={profile._count?.followers ?? profile.followersCount ?? 0}
          onClick={() => {/* open followers modal */}}
        />
        <StatPill
          label="Following"
          value={profile._count?.following ?? profile.followingCount ?? 0}
          onClick={() => {/* open following modal */}}
        />
      </div>
    </div>
  )
}

export default ProfileHeader
