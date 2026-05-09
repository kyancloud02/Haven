import { useState, useEffect } from 'react'

export function useGameTime() {
  const [gameTime, setGameTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(Date.now())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return gameTime
}
