import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = '',
  animate = true 
}) => {
  return (
    <motion.span
      className={cn(
        "bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto]",
        className
      )}
      animate={animate ? {
        backgroundPosition: ['0% center', '200% center'],
      } : {}}
      transition={{
        duration: 3,
        ease: "linear",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.span>
  )
}




