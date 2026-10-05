import { describe, it } from 'node:test';
import assert from 'node:assert';
import { translations } from '../src/client/i18n/translations';

describe('Marketing Content & Navigation (Accueil, Fonctionnement, Tarifs)', () => {
  it('has complete Accueil translations with required titles and sections', () => {
    // French
    assert.strictEqual(translations.fr.landing.heroTitle, 'Défiez votre esprit. 5 minutes par jour.');
    assert.ok(translations.fr.landing.heroSubtitle.includes('mémoire'));
    assert.ok(translations.fr.landing.heroSubtitle.includes('logique'));
    assert.ok(translations.fr.landing.heroSubtitle.includes('attention'));
    assert.ok(translations.fr.landing.heroSubtitle.includes('rapidité'));

    // English
    assert.strictEqual(translations.en.landing.heroTitle, 'Challenge your brain. 5 minutes a day.');

    // 6 cognitive disciplines
    assert.strictEqual(translations.fr.landing.featureMemoryTitle, 'Mémoire');
    assert.strictEqual(translations.fr.landing.featureLogicTitle, 'Logique');
    assert.strictEqual(translations.fr.landing.featureAttentionTitle, 'Attention');
    assert.strictEqual(translations.fr.landing.featurePatternsTitle, 'Patterns');
    assert.strictEqual(translations.fr.landing.featureReactionTitle, 'Réaction');
    assert.strictEqual(translations.fr.landing.featureQuizTitle, 'Quiz');

    // Ethical transparency disclaimer
    assert.ok(!translations.fr.landing.disclaimer.includes('médical'));
    assert.ok(translations.fr.landing.disclaimer.includes('performances'));

    // Contact card in French
    assert.strictEqual(translations.fr.landing.contactBadge, 'Support & Échange');
    assert.strictEqual(translations.fr.landing.contactTitle, 'Une question ?');
    assert.strictEqual(translations.fr.landing.contactDesc, 'Vous avez une question concernant BrainForge, une suggestion ou une idée de collaboration ?');
    assert.strictEqual(translations.fr.landing.contactCta, 'Nous contacter');

    // Contact card in English
    assert.strictEqual(translations.en.landing.contactBadge, 'Support & Inquiries');
    assert.strictEqual(translations.en.landing.contactTitle, 'Have a question?');
    assert.strictEqual(translations.en.landing.contactDesc, 'Have a question about BrainForge, a suggestion, or a collaboration idea?');
    assert.strictEqual(translations.en.landing.contactCta, 'Contact us');
  });

  it('has complete Fonctionnement translations covering the 5 steps and 6 categories', () => {
    assert.strictEqual(translations.fr.howItWorks.heroTitle, 'Comment fonctionne BrainForge ?');
    assert.ok(translations.fr.howItWorks.step1Title.includes('Créez votre compte'));
    assert.ok(translations.fr.howItWorks.step2Title.includes('Choisissez un défi'));
    assert.ok(translations.fr.howItWorks.step3Title.includes('Jouez'));
    assert.ok(translations.fr.howItWorks.step4Title.includes('Obtenez votre score'));
    assert.ok(translations.fr.howItWorks.step5Title.includes('Progressez'));

    // 4 key metrics
    assert.strictEqual(translations.fr.howItWorks.metricScore, 'Score');
    assert.strictEqual(translations.fr.howItWorks.metricAccuracy, 'Pourcentage');
    assert.strictEqual(translations.fr.howItWorks.metricDuration, 'Durée');
    assert.strictEqual(translations.fr.howItWorks.metricXp, 'XP');

    // Transparent disclaimer
    assert.ok(translations.fr.howItWorks.disclaimerText.includes('ne constituent en aucun cas une évaluation médicale'));

    // English howItWorks
    assert.strictEqual(translations.en.howItWorks.heroBadge, 'Guide & Walkthrough');
    assert.strictEqual(translations.en.howItWorks.step1Headline, 'A simple signup in seconds');
    assert.strictEqual(translations.en.howItWorks.pipeSignupTitle, '01. Signup');
    assert.strictEqual(translations.en.howItWorks.pipeProfileTitle, '02. Profile');
    assert.strictEqual(translations.en.howItWorks.pipeDashboardTitle, '03. Dashboard');
    assert.strictEqual(translations.en.howItWorks.step2Headline, 'Six balanced cognitive categories');
    assert.strictEqual(translations.en.howItWorks.catMemoryTitle, 'Memory');
    assert.strictEqual(translations.en.howItWorks.catLogicTitle, 'Logic');
    assert.strictEqual(translations.en.howItWorks.catAttentionTitle, 'Attention');
    assert.strictEqual(translations.en.howItWorks.catPatternsTitle, 'Patterns');
    assert.strictEqual(translations.en.howItWorks.catReactionTitle, 'Reaction');
    assert.strictEqual(translations.en.howItWorks.catQuizTitle, 'Quiz');
    assert.strictEqual(translations.en.howItWorks.step3Headline, 'Clear rules and immediate evaluation');
    assert.strictEqual(translations.en.howItWorks.stageA, 'Step A');
    assert.strictEqual(translations.en.howItWorks.stageB, 'Step B');
    assert.strictEqual(translations.en.howItWorks.step4Headline, 'Precise metrics after each challenge');
    assert.strictEqual(translations.en.howItWorks.metric1Label, 'Metric 1');
    assert.strictEqual(translations.en.howItWorks.metric2Label, 'Metric 2');
    assert.strictEqual(translations.en.howItWorks.step5Headline, 'A long-term progression journey');
    assert.strictEqual(translations.en.howItWorks.cardXpTitle, '1. XP Gain');
    assert.strictEqual(translations.en.howItWorks.cardLevelsTitle, '2. Levels');
    assert.strictEqual(translations.en.howItWorks.cardProgressTitle, '3. Progression');
    assert.strictEqual(translations.en.howItWorks.cardHistoryTitle, '4. History');
  });

  it('has complete Tarifs translations covering Free and Premium plans with FAQ', () => {
    assert.strictEqual(translations.fr.pricing.freePrice, '0 €');
    assert.strictEqual(translations.fr.pricing.premiumPrice, '4,99 €');
    assert.strictEqual(translations.fr.pricing.freeTitle, 'Gratuit');
    assert.strictEqual(translations.fr.pricing.premiumTitle, 'Premium');

    // Comparison features
    assert.ok(translations.fr.pricing.feat1.includes('4 jeux'));
    assert.ok(translations.fr.pricing.feat2.includes('score'));

    // FAQ questions
    assert.ok(translations.fr.pricing.faq1Q.includes('gratuit'));
    assert.ok(translations.fr.pricing.faq2Q.includes('carte bancaire'));
    assert.ok(translations.fr.pricing.faq4Q.includes('médicale'));
  });

  it('has valid legal constants, contact details, and Quebec/Canada compliance metadata', async () => {
    const {
      LEGAL_DOCUMENT_VERSION,
      LEGAL_LAST_UPDATED,
      LEGAL_ORGANIZATION_NAME,
      LEGAL_CONTACT_EMAIL,
      LEGAL_DPO_TITLE,
    } = await import('../src/client/pages/LegalConstants');

    assert.strictEqual(LEGAL_DOCUMENT_VERSION, '1.0');
    assert.strictEqual(LEGAL_LAST_UPDATED, '2026');
    assert.strictEqual(LEGAL_ORGANIZATION_NAME, 'AI Nova Crew');
    assert.strictEqual(LEGAL_CONTACT_EMAIL, 'ai.novacrew@gmail.com');
    assert.ok(LEGAL_DPO_TITLE.includes('protection des renseignements personnels'));
  });

  it('guarantees complete English navigation and landing keys when locale is EN without French leakage', () => {
    // English navigation
    assert.strictEqual(translations.en.nav.home, 'Home');
    assert.strictEqual(translations.en.nav.howItWorks, 'How it works');
    assert.strictEqual(translations.en.nav.pricing, 'Pricing');
    assert.strictEqual(translations.en.nav.daily, 'Daily Challenge');
    assert.strictEqual(translations.en.nav.leaderboard, 'Leaderboard');
    assert.strictEqual(translations.en.nav.train, 'Workout');
    assert.strictEqual(translations.en.nav.profile, 'Profile');
    assert.strictEqual(translations.en.nav.settings, 'Settings');

    // French navigation
    assert.strictEqual(translations.fr.nav.home, 'Accueil');
    assert.strictEqual(translations.fr.nav.howItWorks, 'Fonctionnement');
    assert.strictEqual(translations.fr.nav.pricing, 'Tarifs');
    assert.strictEqual(translations.fr.nav.daily, 'Défi du Jour');
    assert.strictEqual(translations.fr.nav.leaderboard, 'Classement');
    assert.strictEqual(translations.fr.nav.train, 'Entraînement');
    assert.strictEqual(translations.fr.nav.profile, 'Profil');
    assert.strictEqual(translations.fr.nav.settings, 'Paramètres');

    // Visual equation & hero tokens in EN
    assert.strictEqual(translations.en.landing.heroBadge, 'BrainForge — Short Brain Training SaaS');
    assert.strictEqual(translations.en.landing.scoresStepTitle, 'Scores');
    assert.strictEqual(translations.en.landing.historyStepTitle, 'History');
    assert.strictEqual(translations.en.landing.oneChallenge, '1 challenge');
    assert.strictEqual(translations.en.landing.oneScore, '1 score');
    assert.strictEqual(translations.en.landing.oneProgression, '1 progression');

    // Visual equation & hero tokens in FR
    assert.strictEqual(translations.fr.landing.heroBadge, 'BrainForge — SaaS de défis cérébraux courts');
    assert.strictEqual(translations.fr.landing.scoresStepTitle, 'Scores');
    assert.strictEqual(translations.fr.landing.historyStepTitle, 'Historique');
    assert.strictEqual(translations.fr.landing.oneChallenge, '1 défi');
    assert.strictEqual(translations.fr.landing.oneScore, '1 score');
    assert.strictEqual(translations.fr.landing.oneProgression, '1 progression');
  });
});
