'use server'

import { cookies } from 'next/headers'
import { authService } from '../auth-service'

export async function getUserId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) throw new Error('No token found')

  try {
    const payload = await authService.verifyToken(token.value)
    if (!payload) throw new Error('Invalid token')
    return payload.userId
  } catch (error) {
    console.error('Failed to get user id:', error)
    throw error
  }
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    await getUserId()
    return true
  } catch (error) {
    return false
  }
}
