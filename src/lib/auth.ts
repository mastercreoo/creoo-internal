import bcrypt from 'bcryptjs';

/**
 * Hash a plaintext password using bcryptjs (10 rounds)
 * @param password - Plaintext password to hash
 * @returns Bcrypt hash
 */
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verify a plaintext password against a bcrypt hash
 * @param password - Plaintext password to verify
 * @param hash - Bcrypt hash from database
 * @returns true if password matches hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Session data stored in httpOnly cookie
 */
export interface SessionData {
  userId: string;
  role: string;
}
