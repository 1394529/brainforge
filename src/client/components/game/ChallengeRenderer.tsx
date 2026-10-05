import React from 'react';
import { ChallengeSummary, ChallengeType } from '../../../types';
import { QuizChallenge } from './QuizChallenge';
import { PatternChallenge } from './PatternChallenge';
import { MemoryChallenge } from './MemoryChallenge';
import { ReactionChallenge } from './ReactionChallenge';
import { QuizContent } from '../../../types/quiz';
import { PatternContent } from '../../../types/pattern';
import { MemoryContent } from '../../../types/memory';
import { ReactionContent } from '../../../types/reaction';

interface ChallengeRendererProps {
  challenge: ChallengeSummary;
  isSubmitting: boolean;
  onSubmit: (submissionPayload: unknown) => void;
}

export const ChallengeRenderer: React.FC<ChallengeRendererProps> = ({
  challenge,
  isSubmitting,
  onSubmit,
}) => {
  switch (challenge.type) {
    case 'quiz':
      return (
        <QuizChallenge
          content={challenge.content as QuizContent}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case 'pattern':
      return (
        <PatternChallenge
          content={challenge.content as PatternContent}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case 'memory':
      return (
        <MemoryChallenge
          content={challenge.content as MemoryContent}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case 'reaction':
      return (
        <ReactionChallenge
          content={challenge.content as ReactionContent}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    default:
      return (
        <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400">
          Unsupported challenge type: {(challenge as any).type}
        </div>
      );
  }
};
