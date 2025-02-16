'use server';

import { authService } from '../auth-service';

export async function login(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
}

export async function getUserId(token?: string): Promise<string> {
  if (!token) throw new Error('No token found');

  try {
    const payload = await authService.verifyToken(token);
    if (!payload) throw new Error('Invalid token');
    return payload.userId;
  } catch (error) {
    console.error('Failed to get user id:', error);
    throw error;
  }
}
