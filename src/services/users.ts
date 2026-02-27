'use server';

import { db } from '@/lib/insforge';
import { hashPassword, verifyPassword } from '@/lib/auth';

export type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
};

export type UserWithoutPassword = Omit<User, 'password_hash'>;

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
};

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as User) ?? null;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return (data as User) ?? null;
}

/**
 * Get all users (without password hashes)
 */
export async function getAllUsers(): Promise<UserWithoutPassword[]> {
  const { data, error } = await db
    .from('users')
    .select('id, name, email, role, created_at');

  if (error) throw error;
  return (data as UserWithoutPassword[]) ?? [];
}

/**
 * Create new user
 */
export async function createUser(input: CreateUserInput): Promise<UserWithoutPassword> {
  const password_hash = hashPassword(input.password);

  const payload = {
    name: input.name,
    email: input.email.toLowerCase(),
    password_hash,
    role: input.role ?? 'user',
  };

  const { data, error } = await db
    .from('users')
    .insert(payload)
    .select('id, name, email, role, created_at')
    .single();

  if (error) throw error;
  return data as UserWithoutPassword;
}

/**
 * Update user (admin can change name, email, role)
 */
export async function updateUser(
  id: string,
  updates: UpdateUserInput
): Promise<UserWithoutPassword> {
  const updatePayload: any = {};

  if (updates.name !== undefined) {
    updatePayload.name = updates.name;
  }
  if (updates.email !== undefined) {
    updatePayload.email = updates.email.toLowerCase();
  }
  if (updates.role !== undefined) {
    updatePayload.role = updates.role;
  }

  const { data, error } = await db
    .from('users')
    .update(updatePayload)
    .eq('id', id)
    .select('id, name, email, role, created_at')
    .single();

  if (error) throw error;
  return data as UserWithoutPassword;
}

/**
 * Change user password
 * @param userId - User ID
 * @param currentPassword - Current password (for verification)
 * @param newPassword - New password to set
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const password_hash = hashPassword(newPassword);

  // Update password
  const { error } = await db
    .from('users')
    .update({ password_hash })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  const { error } = await db
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

