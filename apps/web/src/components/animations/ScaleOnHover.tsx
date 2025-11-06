import React from 'react'
import { motion } from 'framer-motion'

interface ScaleOnHoverProps {
  children: React.ReactNode
  scale?: number
}

export const ScaleOnHover: React.FC<ScaleOnHoverProps> = ({ 
  children,
  scale = 1.05 
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  )
}






