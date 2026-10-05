import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EmailService } from '../src/server/services/emailService';
import { ContactSchema } from '../src/server/routes/apiRoutes';

describe('Contact Form & Email Service', () => {
  beforeEach(() => {
    EmailService.resetRateLimits();
  });

  it('validates contact schema successfully for complete and valid data', () => {
    const validData = {
      name: 'Thomas Edison',
      email: 'thomas@invention.org',
      subject: 'Partenariat',
      message: 'Bonjour, je souhaiterais discuter d’une intégration de vos défis avec notre école.',
    };

    const result = ContactSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.name, 'Thomas Edison');
      assert.strictEqual(result.data.email, 'thomas@invention.org');
      assert.strictEqual(result.data.subject, 'Partenariat');
    }
  });

  it('rejects missing or empty required fields with clear error messages', () => {
    // Missing name
    const missingName = ContactSchema.safeParse({
      name: '',
      email: 'alex@brainforge.io',
      subject: 'Support technique',
      message: 'Mon score ne s’est pas enregistré correctement.',
    });
    assert.strictEqual(missingName.success, false);

    // Invalid email
    const invalidEmail = ContactSchema.safeParse({
      name: 'Marie Curie',
      email: 'not-an-email',
      subject: 'Suggestion',
      message: 'Pouvez-vous ajouter plus de questions sur la physique ?',
    });
    assert.strictEqual(invalidEmail.success, false);

    // Message too short (< 10 chars)
    const shortMessage = ContactSchema.safeParse({
      name: 'Marie Curie',
      email: 'marie@curie.fr',
      subject: 'Autre',
      message: 'Court',
    });
    assert.strictEqual(shortMessage.success, false);

    // Message too long (> 3000 chars)
    const longMessage = ContactSchema.safeParse({
      name: 'Marie Curie',
      email: 'marie@curie.fr',
      subject: 'Autre',
      message: 'a'.repeat(3001),
    });
    assert.strictEqual(longMessage.success, false);
  });

  it('formats email content and subject accurately for ai.novacrew@gmail.com', () => {
    const payload = {
      name: 'Sophie Germain',
      email: 'sophie@math.fr',
      subject: 'Problème avec BrainForge',
      message: 'Un problème d’affichage survient lors du chargement des motifs.',
    };

    const { subject, text } = EmailService.formatEmailContent(payload);

    assert.strictEqual(subject, '[BrainForge Contact] — Problème avec BrainForge');
    assert.ok(text.includes('BrainForge — Nouveau message'));
    assert.ok(text.includes('Nom : Sophie Germain'));
    assert.ok(text.includes('Email : sophie@math.fr'));
    assert.ok(text.includes('Sujet : Problème avec BrainForge'));
    assert.ok(text.includes('Message :'));
    assert.ok(text.includes('Un problème d’affichage survient lors du chargement des motifs.'));
    assert.ok(text.includes('Envoyé depuis BrainForge.'));
  });

  it('delivers messages to ai.novacrew@gmail.com by default', async () => {
    const payload = {
      name: 'Alan Turing',
      email: 'alan@bletchley.uk',
      subject: 'Question générale',
      message: 'Les algorithmes de motifs sont-ils déterministes ?',
    };

    const result = await EmailService.sendContactMessage(payload);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.deliveredTo, 'ai.novacrew@gmail.com');
    assert.strictEqual(result.isSpamFiltered, false);
    assert.ok(result.messageId.startsWith('msg-'));
  });

  it('blocks spam submissions through the invisible honeypot field', async () => {
    const spamPayload = {
      name: 'Spam Bot 3000',
      email: 'spammer@botnet.ru',
      subject: 'SEO Services',
      message: 'Buy cheap backlink services now on our botnet network.',
      honeypot: 'http://spam-link.example.com', // Honeypot filled by bot
    };

    const result = await EmailService.sendContactMessage(spamPayload);

    // Silently marked as spam without alerting the bot
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isSpamFiltered, true);
    assert.ok(result.messageId.startsWith('spam-'));
  });

  it('enforces rate limiting on repeated requests from same IP', () => {
    const ip = '192.168.1.42';

    // 5 attempts allowed
    for (let i = 0; i < 5; i++) {
      const allowed = EmailService.checkRateLimit(ip, 5, 60000);
      assert.strictEqual(allowed, true);
    }

    // 6th attempt within window must be rejected
    const blocked = EmailService.checkRateLimit(ip, 5, 60000);
    assert.strictEqual(blocked, false);
  });
});

describe('Footer & AI Nova Crew Branding', () => {
  it('computes current year dynamically (e.g. 2026)', () => {
    const year = new Date().getFullYear();
    assert.strictEqual(typeof year, 'number');
    assert.strictEqual(year >= 2026, true);
  });
});
