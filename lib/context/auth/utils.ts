import { UserPayload } from '@/lib/services/auth-service';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getTokenPayload(
  token: string
): Promise<UserPayload | null> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return verified.payload as UserPayload;
  } catch {
    return null;
  }
}
