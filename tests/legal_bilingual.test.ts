import { describe, it } from 'node:test';
import assert from 'node:assert';
import { privacyFr } from '../src/client/locales/fr/privacy';
import { privacyEn } from '../src/client/locales/en/privacy';
import { termsFr } from '../src/client/locales/fr/terms';
import { termsEn } from '../src/client/locales/en/terms';
import { translations } from '../src/client/i18n/translations';

describe('Bilingual Legal Pages & Footer i18n', () => {
  it('TEST 1 & 2: FR Privacy & Terms contain 100% French content without English leakage', () => {
    // Privacy FR
    assert.strictEqual(privacyFr.meta.title, 'Politique de confidentialité | BrainForge');
    assert.strictEqual(privacyFr.header.title, 'Politique de confidentialité');
    assert.strictEqual(privacyFr.header.lastUpdatedLabel, 'Dernière mise à jour');
    assert.strictEqual(privacyFr.header.badge, 'Protection des renseignements personnels');
    assert.ok(privacyFr.header.intro.includes('AI Nova Crew exploite BrainForge'));
    assert.ok(privacyFr.header.intro.includes('renseignements personnels'));

    // Terms FR
    assert.strictEqual(termsFr.meta.title, "Conditions d'utilisation | BrainForge");
    assert.strictEqual(termsFr.header.title, "Conditions d'utilisation");
    assert.strictEqual(termsFr.header.lastUpdatedLabel, 'Dernière mise à jour');
    assert.strictEqual(termsFr.header.badge, 'Cadre contractuel & Conditions d’utilisation');
    assert.ok(termsFr.header.intro.includes('Les présentes Conditions d’utilisation régissent'));
  });

  it('TEST 3 & 4: EN Privacy & Terms contain 100% English content without French leakage', () => {
    // Privacy EN
    assert.strictEqual(privacyEn.meta.title, 'Privacy Policy | BrainForge');
    assert.strictEqual(privacyEn.header.title, 'Privacy Policy');
    assert.strictEqual(privacyEn.header.lastUpdatedLabel, 'Last updated');
    assert.strictEqual(privacyEn.header.badge, 'Protection of Personal Information');
    assert.ok(privacyEn.header.intro.includes('AI Nova Crew operates BrainForge'));
    assert.ok(privacyEn.header.intro.includes('personal information'));

    // Terms EN
    assert.strictEqual(termsEn.meta.title, 'Terms of Service | BrainForge');
    assert.strictEqual(termsEn.header.title, 'Terms of Service');
    assert.strictEqual(termsEn.header.lastUpdatedLabel, 'Last updated');
    assert.strictEqual(termsEn.header.badge, 'Contractual Framework & Terms of Service');
    assert.ok(termsEn.header.intro.includes('These Terms of Service govern'));
  });

  it('TEST 5: FR Footer displays strictly French labels', () => {
    const frFooter = translations.fr.footer;
    assert.strictEqual(frFooter.privacy, 'Confidentialité');
    assert.strictEqual(frFooter.terms, "Conditions d'utilisation");
    assert.strictEqual(frFooter.colBrand, 'BrainForge');
    assert.strictEqual(frFooter.colAccount, 'Compte');
    assert.strictEqual(frFooter.colInfo, 'Informations');
    assert.strictEqual(frFooter.directContact, 'Contact direct');
    assert.strictEqual(frFooter.rightsReserved, 'Tous droits réservés.');
    assert.strictEqual(frFooter.slogan, 'BrainForge — Défiez votre esprit. 5 minutes par jour.');
    assert.ok(frFooter.brandDesc.includes('expériences numériques intelligentes'));
    assert.ok(frFooter.brainForgeDesc.includes('défis cérébraux'));
  });

  it('TEST 6: EN Footer displays strictly English labels', () => {
    const enFooter = translations.en.footer;
    assert.strictEqual(enFooter.privacy, 'Privacy Policy');
    assert.strictEqual(enFooter.terms, 'Terms of Service');
    assert.strictEqual(enFooter.colBrand, 'BrainForge');
    assert.strictEqual(enFooter.colAccount, 'Account');
    assert.strictEqual(enFooter.colInfo, 'Information');
    assert.strictEqual(enFooter.directContact, 'Direct Contact');
    assert.strictEqual(enFooter.rightsReserved, 'All rights reserved.');
    assert.strictEqual(enFooter.slogan, 'BrainForge — Challenge your brain. 5 minutes a day.');
    assert.ok(enFooter.brandDesc.includes('builds intelligent, useful, and accessible'));
    assert.ok(enFooter.brainForgeDesc.includes('gamified cognitive challenge platform'));
  });

  it('TEST 7: Structure and sections are aligned between FR and EN Privacy Policies', () => {
    assert.strictEqual(privacyFr.sections.length, privacyEn.sections.length);
    for (let i = 0; i < privacyFr.sections.length; i++) {
      assert.strictEqual(privacyFr.sections[i].id, privacyEn.sections[i].id);
      assert.strictEqual(privacyFr.sections[i].number, privacyEn.sections[i].number);
    }
  });

  it('TEST 8: Structure and sections are aligned between FR and EN Terms of Service', () => {
    assert.strictEqual(termsFr.sections.length, termsEn.sections.length);
    for (let i = 0; i < termsFr.sections.length; i++) {
      assert.strictEqual(termsFr.sections[i].id, termsEn.sections[i].id);
      assert.strictEqual(termsFr.sections[i].number, termsEn.sections[i].number);
    }
  });

  it('TEST 9: No French remnants in EN privacy & terms', () => {
    // English privacy text shouldn't have common French legal markers
    const enPrivacyStr = JSON.stringify(privacyEn);
    assert.ok(!enPrivacyStr.includes('renseignements personnels'));
    assert.ok(!enPrivacyStr.includes('Dernière mise à jour'));
    assert.ok(!enPrivacyStr.includes('Politique de confidentialité'));

    // English terms text shouldn't have common French legal markers
    const enTermsStr = JSON.stringify(termsEn);
    assert.ok(!enTermsStr.includes("Conditions d'utilisation"));
    assert.ok(!enTermsStr.includes('Dernière mise à jour'));
    assert.ok(!enTermsStr.includes('Rappel de sécurité'));
  });

  it('TEST 10: No English remnants in FR privacy & terms', () => {
    const frPrivacyStr = JSON.stringify(privacyFr);
    assert.ok(!frPrivacyStr.includes('Privacy Policy'));
    assert.ok(!frPrivacyStr.includes('Last updated'));
    assert.ok(!frPrivacyStr.includes('Table of Contents'));

    const frTermsStr = JSON.stringify(termsFr);
    assert.ok(!frTermsStr.includes('Terms of Service'));
    assert.ok(!frTermsStr.includes('Last updated'));
  });
});
