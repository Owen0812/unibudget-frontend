// src/hooks/useDebounce.js
// Inspired by usehooks-ts best practices
// Delays propagating a value update until the user stops changing it

import { useState, useEffect } from "react"

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Start a timer — only fire after the user stops interacting
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: if value changes before delay ends, cancel the previous timer
    // This is the core mechanic that prevents flooding the backend with requests
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce