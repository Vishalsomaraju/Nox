import { motion } from 'framer-motion'

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
  fullWidth = false,
}) {
  const isDisabled = disabled || loading

  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3',
  }

  const variantClass = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  }

  return (
    <motion.button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      className={`
        ${variantClass[variant] || 'btn-primary'}
        ${sizeClasses[size] || sizeClasses.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      {loading && (
        <div
          className="spinner"
          style={{
            width: size === 'sm' ? 14 : 18,
            height: size === 'sm' ? 14 : 18,
            borderColor: variant === 'primary' ? 'rgba(255,255,255,0.3)' : 'var(--border)',
            borderTopColor: variant === 'primary' ? '#fff' : 'var(--accent)',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </motion.button>
  )
}

export default Button
