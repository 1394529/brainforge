import React from 'react';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';
import { TermsOfServicePage } from './TermsOfServicePage';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  if (type === 'privacy') {
    return <PrivacyPolicyPage onBackToHome={onBack} />;
  }
  return <TermsOfServicePage onBackToHome={onBack} />;
};
