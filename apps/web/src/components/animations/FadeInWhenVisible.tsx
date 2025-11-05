import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface FadeInWhenVisibleProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const FadeInWhenVisible: React.FC<FadeInWhenVisibleProps> = ({ 
  children, 
  delay = 0,
  direction = 'up' 
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        x: 0
      } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
    >
      {children}
    </motion.div>
  )
}




