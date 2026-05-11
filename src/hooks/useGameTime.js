import { useState, useEffect } from 'react'

export function getTimeState(hour) {
  if (hour >= 8 && hour < 18) return 'AWAY'
  if (hour >= 18 && hour < 22) return 'HOME'
  return 'SLEEP'
}

export function useGameTime() {
  const [timeState, setTimeState] = useState(() => getTimeState(new Date().getHours()))

  useEffect(() => {
    function tick() {
      setTimeState(getTimeState(new Date().getHours()))
    }

    // Align to the next top-of-minute so state changes exactly on the hour
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds()
    const timeout = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 60_000)
      return () => clearInterval(interval)
    }, msUntilNextMinute)

    return () => clearTimeout(timeout)
  }, [])

  return timeState
}
