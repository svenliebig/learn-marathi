import { db } from '@/lib/persistence/db'
import { compare } from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export type UserPayload = {
  userId: string
}

export class AuthService {
  async login(email: string, password: string) {
    const user = await db.getUser(email)
    if (!user) return null

    const isValid = await compare(password, user.password)
    if (!isValid) return null

    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET))

    return { user, token }
  }

  async signup(email: string, password: string) {
    const existingUser = await db.getUser(email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    const user = await db.createUser(email, password)
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET))

    return { user, token }
  }

  async verifyToken(token: string) {
    try {
      const result = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      return result.payload as UserPayload
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()
