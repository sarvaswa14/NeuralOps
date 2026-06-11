import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!user) return

    const s = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem('token') }
    })

    s.on('connect', () => setSocket(s))
    s.on('disconnect', () => setSocket(null))

    return () => s.disconnect()
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}