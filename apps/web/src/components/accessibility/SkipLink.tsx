import React from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {children}
    </a>
  )
}

export const SkipLinks: React.FC = () => {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
    </>
  )
}



