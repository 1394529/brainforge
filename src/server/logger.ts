export type LogEventType =
  | 'signup'
  | 'login'
  | 'logout'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'password_changed'
  | 'challenge_started'
  | 'challenge_submitted'
  | 'challenge_completed'
  | 'xp_awarded'
  | 'level_up'
  | 'admin_action'
  | 'contact_message_sent'
  | 'contact_message_spam'
  | 'contact_message_error';

interface LogPayload {
  userId?: string;
  email?: string;
  challengeId?: string;
  attemptId?: string;
  amount?: number;
  level?: number;
  [key: string]: unknown;
}

export class Logger {
  public static log(event: LogEventType, payload: LogPayload = {}): void {
    // Sanitize any sensitive info
    const sanitized = { ...payload };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.answerKey;
    delete sanitized.answer_key;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...sanitized,
    };

    console.log(`[BrainForge Log] ${JSON.stringify(logEntry)}`);
  }

  public static info(message: string, meta: Record<string, unknown> = {}): void {
    console.log(`[BrainForge INFO] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`);
  }

  public static warn(message: string, meta: Record<string, unknown> = {}): void {
    console.warn(`[BrainForge WARN] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`);
  }

  public static error(message: string, meta: Record<string, unknown> = {}): void {
    console.error(`[BrainForge ERROR] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`);
  }
}
