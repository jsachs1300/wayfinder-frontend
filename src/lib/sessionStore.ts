type SessionData = {
  token: string
  isAdmin: boolean
  expiresAt?: string
}

type SessionListener = (session: SessionData | null) => void

let session: SessionData | null = null
const listeners = new Set<SessionListener>()

export function getSession() {
  return session
}

export function setSession(next: SessionData) {
  session = next
  listeners.forEach((listener) => listener(session))
}

export function clearSession() {
  session = null
  listeners.forEach((listener) => listener(session))
}

export function subscribeSession(listener: SessionListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
