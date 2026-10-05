import { Database } from '../db';
import { UserProfile } from '../../types';
import { Logger } from '../logger';
import crypto from 'crypto';

interface SessionTokenData {
  userId: string;
  email: string;
  expiresAt: number;
}

export class AuthService {
  private static sessions: Map<string, SessionTokenData> = new Map();

  public static initialize(): void {
    const db = Database.getInstance();
    // Register demo session
    const demo = db.getProfile('usr-demo-001');
    if (demo) {
      this.sessions.set('demo-token-alex', {
        userId: demo.id,
        email: demo.email,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
      });
    }
    // Register admin session
    const admin = db.getProfile('usr-admin-001');
    if (admin) {
      this.sessions.set('admin-token-super', {
        userId: admin.id,
        email: admin.email,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
    }
  }

  public static signup(params: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): { user: UserProfile; token: string } {
    const { displayName, email, password, confirmPassword } = params;

    if (!displayName || displayName.trim().length < 2) {
      throw new Error('Display name must be at least 2 characters.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword) {
      throw new Error('Password confirmation does not match.');
    }

    const db = Database.getInstance();
    const existing = db.getProfileByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
    const profile = db.createProfile({
      email,
      username,
      displayName,
      password,
      role: 'user',
    });

    const token = `token-${profile.id}-${crypto.randomBytes(16).toString('hex')}`;
    this.sessions.set(token, {
      userId: profile.id,
      email: profile.email,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 days
    });

    Logger.log('signup', { userId: profile.id, email: profile.email });
    return { user: profile, token };
  }

  public static login(email: string, passwordAttempt?: string): { user: UserProfile; token: string } {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required.');
    }

    const db = Database.getInstance();
    const profile = db.getProfileByEmail(email);
    if (!profile) {
      throw new Error('Invalid email or password.');
    }

    if (passwordAttempt) {
      const isValid = db.verifyPassword(email, passwordAttempt);
      if (!isValid) {
        throw new Error('Invalid email or password.');
      }
    }

    const token = `token-${profile.id}-${crypto.randomBytes(16).toString('hex')}`;
    this.sessions.set(token, {
      userId: profile.id,
      email: profile.email,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14,
    });

    Logger.log('login', { userId: profile.id, email: profile.email });
    return { user: profile, token };
  }

  public static googleAuth(email?: string, name?: string): { user: UserProfile; token: string } {
    const db = Database.getInstance();
    const targetEmail = (email || 'google.user@brainforge.io').toLowerCase().trim();
    let profile = db.getProfileByEmail(targetEmail);

    if (!profile) {
      const username = targetEmail.split('@')[0].replace(/[^a-z0-9]/g, '') || 'googleplayer';
      profile = db.createProfile({
        email: targetEmail,
        username,
        displayName: name || 'Google Player',
        password: crypto.randomBytes(32).toString('hex'),
        role: 'user',
      });
      Logger.log('signup', { userId: profile.id, email: profile.email, provider: 'google' });
    }

    const token = `token-${profile.id}-${crypto.randomBytes(16).toString('hex')}`;
    this.sessions.set(token, {
      userId: profile.id,
      email: profile.email,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14,
    });

    Logger.log('login', { userId: profile.id, email: profile.email, provider: 'google' });
    return { user: profile, token };
  }

  public static requestPasswordReset(email: string): { message: string; resetToken: string } {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required.');
    }

    const db = Database.getInstance();
    const token = db.createPasswordResetToken(email);

    Logger.log('password_reset_request', { email });
    return {
      message: 'Password reset link generated successfully.',
      resetToken: token,
    };
  }

  public static resetPassword(token: string, newPassword: string, confirmPassword: string): { message: string } {
    if (!token) {
      throw new Error('Reset token is required.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('Password confirmation does not match.');
    }

    const db = Database.getInstance();
    db.resetPasswordWithToken(token, newPassword);

    Logger.log('password_reset_complete', { token });
    return { message: 'Password has been reset successfully. You may now sign in.' };
  }

  public static changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): { message: string } {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('Password confirmation does not match.');
    }
    const db = Database.getInstance();
    const profile = db.getProfile(userId);
    if (!profile) {
      throw new Error('User not found.');
    }
    const verified = db.verifyPassword(profile.email, currentPassword);
    if (!verified) {
      throw new Error('Current password is incorrect.');
    }
    db.updatePassword(userId, newPassword);
    Logger.log('password_changed', { userId });
    return { message: 'Password updated successfully.' };
  }

  public static logout(token?: string): void {
    if (!token) return;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const session = this.sessions.get(cleanToken);
    if (session) {
      Logger.log('logout', { userId: session.userId });
      this.sessions.delete(cleanToken);
    }
  }

  public static verifyToken(token?: string): UserProfile | null {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

    // Check demo or admin tokens
    if (cleanToken === 'demo-token-alex') {
      const db = Database.getInstance();
      return db.getProfile('usr-demo-001');
    }
    if (cleanToken === 'admin-token-super') {
      const db = Database.getInstance();
      return db.getProfile('usr-admin-001');
    }

    const session = this.sessions.get(cleanToken);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const db = Database.getInstance();
    return db.getProfile(session.userId);
  }
}
