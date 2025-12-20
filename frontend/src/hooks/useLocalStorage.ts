'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. 初始化狀態：先使用預設值，避免 SSR Hydration Mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 2. 在元件掛載後 (Client-side)，才去讀取 localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.log(error)
    }
  }, [key])

  // 3. 包裝原本的 setValue，增加寫入 localStorage 的功能
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}