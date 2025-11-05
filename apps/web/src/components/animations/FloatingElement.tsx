import React from 'react'
import { motion } from 'framer-motion'

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  yOffset?: number
}

export const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children,
  delay = 0,
  duration = 3,
  yOffset = 20
}) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: [-yOffset, yOffset, -yOffset],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}




