/**
 * BrainForge — Privacy Policy (EN)
 * Fully compliant with Canadian federal (PIPEDA) and Quebec provincial (Act respecting the protection of personal information in the private sector / Law 25) legal frameworks.
 * Publisher: AI Nova Crew (ai.novacrew@gmail.com)
 */

export const privacyEn = {
  meta: {
    title: 'Privacy Policy | BrainForge',
    description: 'BrainForge and AI Nova Crew Privacy Policy.',
    locale: 'en',
    alternateLocale: 'fr',
    alternateUrl: '/fr/confidentialite',
    currentUrl: '/en/privacy',
  },
  header: {
    badge: 'Protection of Personal Information',
    title: 'Privacy Policy',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedDate: '2026',
    versionLabel: 'Version',
    version: '1.0',
    publisherLabel: 'Publisher',
    publisher: 'AI Nova Crew',
    intro:
      'AI Nova Crew operates BrainForge, a digital cognitive training and gamification platform. We place paramount importance on respecting individual privacy and safeguarding the personal information entrusted to us by our users.',
    tableOfContentsTitle: 'Table of Contents',
    backButton: 'Back to Home',
  },
  sections: [
    {
      id: 'sec-intro',
      number: '01',
      title: 'Introduction & Scope',
      content: [
        'This Privacy Policy transparently explains how AI Nova Crew ("we", "our", or "the organization") collects, uses, discloses, retains, and protects your personal information when you access and use the BrainForge platform.',
        'This policy applies to all users who visit BrainForge, create a player account, participate in cognitive games and Daily Challenges, utilize free features or subscribe to Premium services (when enabled), or communicate with our support team.',
        'Applicable legal obligations may vary depending on the user’s place of residence, the nature of the activity, and applicable laws, notably under Quebec’s Act respecting the protection of personal information in the private sector (including amendments introduced by Law 25) and Canada’s federal Personal Information Protection and Electronic Documents Act (PIPEDA).',
      ],
    },
    {
      id: 'sec-who-we-are',
      number: '02',
      title: 'Who We Are & Person in Charge of Personal Information Protection',
      content: [
        'BrainForge is designed, engineered, and operated by AI Nova Crew.',
        'In accordance with the statutory requirements of Quebec’s Law 25, we have appointed a Person in Charge of Personal Information Protection (Privacy Officer) responsible for overseeing compliance with privacy practices:',
      ],
      contactBox: {
        organization: 'AI Nova Crew',
        dpoTitle: 'Person in Charge of Personal Information Protection (Privacy Officer)',
        email: 'ai.novacrew@gmail.com',
        serviceName: 'BrainForge Platform',
      },
    },
    {
      id: 'sec-definition',
      number: '03',
      title: 'Definition of Personal Information',
      content: [
        'Personal information is any information concerning an individual that directly or indirectly allows that individual to be identified (for instance, a name, an email address, or a digital identifier linked to a user profile).',
      ],
    },
    {
      id: 'sec-collected',
      number: '04',
      title: 'Personal Information Collected',
      content: [
        'AI Nova Crew strictly adheres to the principle of data minimization. We collect only the information reasonably necessary to operate active platform features:',
      ],
      categories: [
        {
          name: 'Account Information',
          items: [
            'Full name or chosen player pseudonym',
            'Valid email address',
            'Unique user identifier (UUID)',
            'Language preference (FR / EN)',
            'Timezone for challenge scheduling and reset times',
          ],
        },
        {
          name: 'Gameplay and Progression Data',
          items: [
            'Challenges played and cognitive categories',
            'Submitted answers and evaluations',
            'Scores, percentage accuracy, and response durations in milliseconds',
            'Experience points (XP) and calculated player level',
            'Active consecutive daily streak and personal records',
            'Unlocked achievement badges',
            'Complete workout trial history',
          ],
        },
        {
          name: 'Communication Data',
          items: [
            'Name submitted through the contact form',
            'Correspondence email address',
            'Subject and body of the submitted message',
          ],
        },
        {
          name: 'Technical and Security Information',
          items: [
            'IP address (used strictly for rate limiting and spam protection)',
            'Device type, browser specification, and operating system',
            'Technical error logs and security audit traces',
          ],
        },
      ],
    },
    {
      id: 'sec-purposes',
      number: '05',
      title: 'Why We Collect It (Purposes of Collection)',
      content: [
        'Collected information is processed for explicit, legitimate, and specified purposes:',
      ],
      bullets: [
        'Account Creation and Management: Secure authentication, persistent session management, and credential recovery.',
        'Gameplay Execution & Cognitive Calculation: Evaluating answers, calculating accuracy percentages, and archiving performance records.',
        'Gamification Systems: XP attribution, level calculation, daily streak maintenance, and achievement unlocking.',
        'Public Leaderboard (Optional): Displaying weekly and all-time rankings, strictly when the player has opted into public visibility in settings.',
        'Platform Security & Integrity: Detecting cheating attempts, rate-limiting abusive requests, and defending against unauthorized access.',
        'Customer Support: Accurately responding to inquiries submitted to ai.novacrew@gmail.com.',
        'Continuous Improvement: Optimizing technical responsiveness, challenge latency, and system stability.',
      ],
    },
    {
      id: 'sec-consent',
      number: '06',
      title: 'Consent & Legal Bases',
      content: [
        'Depending on the context and applicable legal framework, processing of your personal information rests upon the performance of the requested service contract, compliance with legal obligations, legitimate security interests recognized by law, or your explicit consent.',
        'Where your consent is required for an optional feature (such as appearing in the public leaderboard), you remain entirely free to grant or withdraw it at any time directly through your account preferences.',
      ],
    },
    {
      id: 'sec-minimal',
      number: '07',
      title: 'Data Minimization & Excluded Data',
      content: [
        'AI Nova Crew intentionally refrains from collecting superfluous, intrusive, or sensitive data. We do not collect:',
      ],
      bullets: [
        'No medical, psychological, or health records',
        'No biometric data',
        'No unnecessary financial or banking details',
        'No sensitive information without an established statutory requirement',
      ],
    },
    {
      id: 'sec-gaming-data',
      number: '08',
      title: 'Gameplay Data & Strict Non-Medical Disclaimer',
      content: [
        'Scores, answers, reaction times, XP, levels, and other gameplay statistics serve primarily for the operation and recreational personalization of the BrainForge experience.',
      ],
      warningBox: {
        title: 'Important Disclaimer — Non-Medical Nature of Results',
        text: 'BrainForge results and metrics reflect performance solely in the platform’s interactive recreational games and challenges. They do not constitute a medical, psychological, psychiatric, or neuropsychological diagnosis, and must never be interpreted as a clinical assessment of intelligence or IQ.',
      },
    },
    {
      id: 'sec-profiling',
      number: '09',
      title: 'Profiling, Performance Trends & Artificial Intelligence Features',
      content: [
        'BrainForge may use performance analytics to identify gameplay trends (such as challenge categories in which a user excels or requires practice) to recommend tailored training sessions.',
        'Where required by law (specifically under Quebec’s Law 25), AI Nova Crew will explicitly inform users when a decision concerning them is based exclusively on automated processing and will provide the applicable rights, explanations, and review mechanisms.',
        'No prospective AI feature is described as active until formally deployed in the current live version of BrainForge.',
      ],
    },
    {
      id: 'sec-third-parties',
      number: '10',
      title: 'Disclosure to Third Parties & Service Providers',
      content: [
        'AI Nova Crew does not sell, rent, or trade any personal information for commercial advertising purposes.',
        'Trusted third-party technology providers may process data on our behalf strictly to operate BrainForge’s technical infrastructure:',
      ],
      bullets: [
        'Google OAuth: Optional, rapid authentication via a verified Google account.',
        'Secure Cloud Infrastructure: Hosting of application code, APIs, and databases.',
        'Certified Payment Processor (e.g. Stripe): When paid subscriptions are enabled, transactions will be handled directly by certified processors compliant with PCI-DSS standards, without card numbers transiting through our servers.',
      ],
    },
    {
      id: 'sec-transfers',
      number: '11',
      title: 'Cross-Border Transfers Outside Quebec & Canada',
      content: [
        'Certain cloud infrastructure and technology providers may host or process personal information outside the province of Quebec or outside Canada.',
        'For operations governed by Quebec privacy legislation, AI Nova Crew conducts privacy impact assessments (PIAs) as mandated by Law 25 to ensure transferred information receives adequate protection aligned with recognized privacy principles.',
      ],
    },
    {
      id: 'sec-security',
      number: '12',
      title: 'Reasonable Security Safeguards',
      content: [
        'AI Nova Crew implements reasonable technical, organizational, and physical safeguards proportionate to the sensitivity of the information:',
      ],
      bullets: [
        'Systematic end-to-end encryption for all data in transit (HTTPS / TLS 1.3).',
        'Cryptographically salted and hashed passwords (passwords are never stored in plaintext).',
        'Strict role-based access control (RBAC) and user data isolation.',
        'Anti-abuse protections (invisible honeypot fields and IP-based rate limiting) on contact endpoints.',
        'Server-side isolation of API keys, environmental secrets, and administrative credentials.',
      ],
      note: 'AI Nova Crew implements reasonable security safeguards adapted to the nature and sensitivity of personal information, recognizing that no electronic system can guarantee absolute invulnerability.',
    },
    {
      id: 'sec-retention',
      number: '13',
      title: 'Retention & Secure Deletion',
      content: [
        'AI Nova Crew retains personal information only for the duration necessary to fulfill the purposes for which it was collected, subject to applicable statutory, contractual, or security retention requirements.',
        'When an account is deleted by the user, associated personal data is permanently erased or irreversibly anonymized, save for technical audit logs that must be maintained for legal compliance, fraud prevention, or defense of claims.',
      ],
    },
    {
      id: 'sec-rights',
      number: '14',
      title: 'Your Rights (Access, Rectification, Withdrawal)',
      content: [
        'Subject to the conditions established by applicable law, you hold the following rights:',
      ],
      bullets: [
        'Right of Access: Request confirmation of and receive a copy of personal information we hold about you.',
        'Right of Rectification: Request correction of inaccurate, incomplete, or ambiguous information.',
        'Right to Withdraw Consent: Revoke consent previously granted for optional processing (e.g. public leaderboard visibility).',
        'Right to Erasure: Request permanent deletion of your account and associated personal data.',
      ],
    },
    {
      id: 'sec-requests',
      number: '15',
      title: 'Access & Correction Request Procedure',
      content: [
        'To exercise any of your statutory privacy rights, please submit a written request via email:',
      ],
      contactAction: {
        email: 'ai.novacrew@gmail.com',
        subject: 'Request — Personal Information',
        instructions:
          'AI Nova Crew will conduct reasonable verification of the applicant’s identity prior to disclosing or altering confidential information and will respond within the timeframes prescribed by law.',
      },
    },
    {
      id: 'sec-incidents',
      number: '16',
      title: 'Privacy Incident Management',
      content: [
        'In the event of a security incident involving personal information (unauthorized access, use, or disclosure), AI Nova Crew promptly takes reasonable measures to mitigate injury and conducts a formal risk assessment.',
        'Where an incident presents a risk of serious injury, mandatory notices are promptly issued to affected individuals as well as to the Commission d’accès à l’information du Québec or competent regulatory authorities. An internal incident log is rigorously maintained.',
      ],
    },
    {
      id: 'sec-cookies',
      number: '17',
      title: 'Cookies & Local Storage Technologies',
      content: [
        'BrainForge employs strictly necessary cookies and local storage tokens indispensable for technical platform operation (secure session tokens, connection persistence, and linguistic preference FR/EN).',
        'We do not employ third-party advertising cookies, retargeting pixels, or invasive behavioral trackers.',
      ],
    },
    {
      id: 'sec-complaints',
      number: '18',
      title: 'Complaints & Regulatory Recourse',
      content: [
        'Any questions or complaints regarding the protection of your personal information may first be submitted to AI Nova Crew at ai.novacrew@gmail.com.',
        'If an issue remains unresolved, individuals residing in Quebec may contact the Commission d’accès à l’information du Québec (CAI), and individuals in other Canadian jurisdictions may contact the Office of the Privacy Commissioner of Canada (OPC) or their provincial oversight authority.',
      ],
    },
    {
      id: 'sec-modifications',
      number: '19',
      title: 'Modifications to this Policy',
      content: [
        'AI Nova Crew may amend this policy from time to time to reflect changes in BrainForge operations, technologies, or statutory requirements.',
        'For significant amendments, users will be notified in accordance with applicable legal requirements (such as via an in-app notice or email).',
      ],
    },
  ],
  disclaimer: {
    title: 'Important Notice',
    text:
      'These documents are intended to present the rules and practices governing the use of BrainForge. They do not constitute formal legal advice. AI Nova Crew should have these documents validated by a qualified legal professional prior to commercial launch, particularly prior to activating payments, subscriptions, and large-scale data processing.',
  },
};
