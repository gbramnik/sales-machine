import React, { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

interface CountUpNumberProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({ 
  end, 
  duration = 2000,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      if (progress < duration) {
        const percentage = progress / duration
        const easeOutQuart = 1 - Math.pow(1 - percentage, 4)
        setCount(Math.floor(end * easeOutQuart))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, isInView])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}








