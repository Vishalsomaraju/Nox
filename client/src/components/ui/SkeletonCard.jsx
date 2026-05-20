function SkeletonCard() {
  return (
    <div
      className="post-card mb-4"
      style={{ padding: '16px' }}
      aria-busy="true"
      aria-label="Loading post"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton rounded-full" style={{ width: 40, height: 40, flexShrink: 0 }} />
        <div className="flex-1">
          <div className="skeleton mb-2" style={{ width: '40%', height: 14 }} />
          <div className="skeleton" style={{ width: '25%', height: 12 }} />
        </div>
        <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6 }} />
      </div>

      {/* Image placeholder */}
      <div
        className="skeleton -mx-4 mb-4"
        style={{ width: 'calc(100% + 32px)', aspectRatio: '4/3' }}
      />

      {/* Caption lines */}
      <div className="skeleton mb-2" style={{ width: '85%', height: 14 }} />
      <div className="skeleton mb-4" style={{ width: '60%', height: 14 }} />

      {/* Action bar */}
      <div className="flex items-center gap-5">
        <div className="skeleton" style={{ width: 52, height: 20 }} />
        <div className="skeleton" style={{ width: 52, height: 20 }} />
        <div className="skeleton" style={{ width: 32, height: 20 }} />
        <div className="skeleton ml-auto" style={{ width: 24, height: 24 }} />
      </div>
    </div>
  )
}

export default SkeletonCard
