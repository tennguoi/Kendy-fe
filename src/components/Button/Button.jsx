import React from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

function Button({
  children,
  className = '',
  variant = 'primary', // 'primary' | 'ghost' | 'glass' | 'dark' | ''
  to,
  href,
  type = 'button',
  ...props
}) {
  const baseClass = 'public-btn'
  const variantClass = variant ? variant : ''
  const fullClassName = `${baseClass} ${variantClass} ${className}`.trim().replace(/\s+/g, ' ')

  if (to) {
    return (
      <Link to={to} className={fullClassName} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={fullClassName} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={fullClassName} {...props}>
      {children}
    </button>
  )
}

export default Button
