import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Database } from '../src/server/db/index';
import { AuthService } from '../src/server/auth/authService';

describe('Authentication & User Management (Supabase Auth Model)', () => {
  beforeEach(() => {
    // Reset DB state for clean testing
    Database.resetInstance();
  });

  it('successfully creates an account on signup and initializes user progress', () => {
    const signupData = {
      displayName: 'Marie Curie',
      email: 'marie.curie@brainforge.io',
      password: 'radiumPassword123',
      confirmPassword: 'radiumPassword123',
    };

    const result = AuthService.signup(signupData);

    assert.ok(result.token, 'Must return a session token');
    assert.equal(result.user.email, 'marie.curie@brainforge.io');
    assert.equal(result.user.displayName, 'Marie Curie');
    assert.equal(result.user.role, 'user');

    // Verify progress was initialized at Level 1, 0 XP
    const db = Database.getInstance();
    const progress = db.getUserProgress(result.user.id);
    assert.equal(progress.currentLevel, 1);
    assert.equal(progress.totalXp, 0);
  });

  it('rejects duplicate email signup', () => {
    const first = {
      displayName: 'First User',
      email: 'duplicate@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    AuthService.signup(first);

    assert.throws(
      () => {
        AuthService.signup({
          displayName: 'Second User',
          email: 'duplicate@test.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
      },
      /already exists/i
    );
  });

  it('rejects passwords shorter than 8 characters or non-matching confirmations', () => {
    assert.throws(
      () => {
        AuthService.signup({
          displayName: 'Short Pass',
          email: 'short@test.com',
          password: 'short',
          confirmPassword: 'short',
        });
      },
      /at least 8 characters/i
    );

    assert.throws(
      () => {
        AuthService.signup({
          displayName: 'Mismatch Pass',
          email: 'mismatch@test.com',
          password: 'validPassword123',
          confirmPassword: 'differentPassword123',
        });
      },
      /does not match/i
    );
  });

  it('authenticates valid credentials and rejects incorrect passwords', () => {
    const email = 'alex@brainforge.io';
    const correctPass = 'password123';

    // Successful login
    const loginRes = AuthService.login(email, correctPass);
    assert.ok(loginRes.token);
    assert.equal(loginRes.user.email, email);

    // Bad password
    assert.throws(
      () => {
        AuthService.login(email, 'wrongPassword999');
      },
      /invalid email or password/i
    );

    // Non-existent email
    assert.throws(
      () => {
        AuthService.login('ghost@brainforge.io', 'password123');
      },
      /invalid email or password/i
    );
  });

  it('supports Google authentication and profile provisioning', () => {
    const res = AuthService.googleAuth('ada.lovelace@gmail.com', 'Ada Lovelace');
    assert.ok(res.token);
    assert.equal(res.user.email, 'ada.lovelace@gmail.com');
    assert.equal(res.user.displayName, 'Ada Lovelace');

    // Logging in again with same Google account should retrieve existing user
    const res2 = AuthService.googleAuth('ada.lovelace@gmail.com', 'Ada Lovelace');
    assert.equal(res2.user.id, res.user.id);
  });

  it('handles password recovery flow: forgot-password then reset-password', () => {
    const email = 'alex@brainforge.io';

    // 1. Request reset token
    const reqRes = AuthService.requestPasswordReset(email);
    assert.ok(reqRes.resetToken, 'Must produce a reset token');

    // 2. Perform reset
    const newPassword = 'newSecuredPassword456';
    const resetRes = AuthService.resetPassword(reqRes.resetToken, newPassword, newPassword);
    assert.ok(resetRes.message.includes('successfully'));

    // 3. Old password should fail
    assert.throws(
      () => {
        AuthService.login(email, 'password123');
      },
      /invalid email or password/i
    );

    // 4. New password should succeed
    const loginRes = AuthService.login(email, newPassword);
    assert.ok(loginRes.token);
    assert.equal(loginRes.user.email, email);
  });

  it('allows authenticated users to change password from settings', () => {
    const email = 'alex@brainforge.io';
    const currentPass = 'password123';
    const loginRes = AuthService.login(email, currentPass);

    // Wrong current password
    assert.throws(
      () => {
        AuthService.changePassword(loginRes.user.id, 'wrongPass', 'brandNewPass123', 'brandNewPass123');
      },
      /current password is incorrect/i
    );

    // Successful update
    const changeRes = AuthService.changePassword(
      loginRes.user.id,
      currentPass,
      'brandNewPass123',
      'brandNewPass123'
    );
    assert.ok(changeRes.message.includes('successfully'));

    // Verify login with new password
    const verifyLogin = AuthService.login(email, 'brandNewPass123');
    assert.ok(verifyLogin.token);
  });

  it('invalidates session token on logout', () => {
    const loginRes = AuthService.login('alex@brainforge.io', 'password123');
    assert.ok(loginRes.token);

    // Verify token is valid
    const user = AuthService.verifyToken(loginRes.token);
    assert.ok(user);
    assert.equal(user.id, loginRes.user.id);

    // Logout
    AuthService.logout(`Bearer ${loginRes.token}`);

    // Verify token is no longer valid
    const expiredUser = AuthService.verifyToken(loginRes.token);
    assert.equal(expiredUser, null);
  });

  it('enforces RBAC: admin role vs regular user role', () => {
    const db = Database.getInstance();
    const admin = db.getProfile('usr-admin-001');
    const player = db.getProfile('usr-demo-001');

    assert.equal(admin?.role, 'admin');
    assert.equal(player?.role, 'user');
  });
});
