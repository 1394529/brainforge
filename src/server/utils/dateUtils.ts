/**
 * Date and Timezone utilities for BrainForge Gamification (Streak, Daily Challenge, Leaderboard)
 */
export class DateUtils {
  /**
   * Format a date into YYYY-MM-DD in the specified timezone (default 'UTC')
   */
  public static getDateString(date: Date = new Date(), timezone: string = 'UTC'): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone || 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date); // outputs YYYY-MM-DD
    } catch {
      // Fallback to UTC if timezone is invalid
      return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get the date string for yesterday in the specified timezone
   */
  public static getYesterdayDateString(referenceDate: Date = new Date(), timezone: string = 'UTC'): string {
    const yesterday = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000);
    return this.getDateString(yesterday, timezone);
  }

  /**
   * Check if dateA and dateB are consecutive days (dateA is exactly one day before dateB)
   */
  public static areConsecutiveDays(earlierDateStr: string, laterDateStr: string): boolean {
    const d1 = new Date(earlierDateStr + 'T00:00:00Z');
    const d2 = new Date(laterDateStr + 'T00:00:00Z');
    const diffMs = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    return diffDays === 1;
  }

  /**
   * Returns start and end timestamps (ISO) of current ISO week (Monday 00:00:00 to Sunday 23:59:59)
   */
  public static getCurrentWeekRange(referenceDate: Date = new Date(), timezone: string = 'UTC'): {
    weekIdentifier: string;
    startIso: string;
    endIso: string;
  } {
    const date = new Date(referenceDate);
    // Determine Monday of current week
    const day = date.getUTCDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() + diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    const weekYear = monday.getUTCFullYear();
    const weekNum = Math.ceil((((monday.getTime() - new Date(Date.UTC(weekYear, 0, 1)).getTime()) / 86400000) + 1) / 7);
    const weekIdentifier = `${weekYear}-W${String(weekNum).padStart(2, '0')}`;

    return {
      weekIdentifier,
      startIso: monday.toISOString(),
      endIso: sunday.toISOString(),
    };
  }
}
