import { CoachContext, CoachResponse, SessionFeedbackContext } from '../../../../types';

export interface AIProvider {
  name: string;
  generateCoachInsight(context: CoachContext): Promise<CoachResponse>;
  generateSessionFeedback(context: SessionFeedbackContext): Promise<string>;
}
