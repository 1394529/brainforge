/**
 * BrainForge — Politique de confidentialité (FR)
 * Conforme au cadre juridique du Québec (Loi 25, Code civil, LPC) et du Canada (LPRPDE / PIPEDA)
 * Éditeur : AI Nova Crew (ai.novacrew@gmail.com)
 */

export const privacyFr = {
  meta: {
    title: 'Politique de confidentialité | BrainForge',
    description: 'Politique de confidentialité de BrainForge et AI Nova Crew.',
    locale: 'fr',
    alternateLocale: 'en',
    alternateUrl: '/en/privacy',
    currentUrl: '/fr/confidentialite',
  },
  header: {
    badge: 'Protection des renseignements personnels',
    title: 'Politique de confidentialité',
    lastUpdatedLabel: 'Dernière mise à jour',
    lastUpdatedDate: '2026',
    versionLabel: 'Version',
    version: '1.0',
    publisherLabel: 'Éditeur',
    publisher: 'AI Nova Crew',
    intro:
      'AI Nova Crew exploite BrainForge, une plateforme numérique de défis cérébraux, interactifs et gamifiés. Nous accordons une importance fondamentale au respect de la vie privée et à la protection rigoureuse des renseignements personnels confiés par nos utilisateurs.',
    tableOfContentsTitle: 'Sommaire des sections',
    backButton: "Retour à l'accueil",
  },
  sections: [
    {
      id: 'sec-intro',
      number: '01',
      title: 'Introduction & Portée',
      content: [
        "La présente Politique de confidentialité explique de manière transparente comment AI Nova Crew (« nous », « notre » ou « l'organisation ») recueille, utilise, communique, conserve et protège vos renseignements personnels lors de votre utilisation de la plateforme BrainForge.",
        "Cette politique s'applique à tous les utilisateurs qui visitent BrainForge, créent un compte joueur, participent aux défis cognitifs et Daily Challenges, utilisent les fonctionnalités gratuites ou souscrivent à des options Premium (lorsque celles-ci sont activées), ou communiquent avec notre équipe de support.",
        "Les obligations légales applicables peuvent varier selon le lieu de résidence de l'utilisateur, la nature de l'activité et les lois applicables, notamment en vertu de la Loi sur la protection des renseignements personnels dans le secteur privé du Québec (incluant les dispositions de la Loi 25) et de la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE / PIPEDA) au niveau fédéral canadien.",
      ],
    },
    {
      id: 'sec-who-we-are',
      number: '02',
      title: 'Qui sommes-nous & Responsable de la protection des renseignements personnels',
      content: [
        'BrainForge est conçu, développé et exploité par AI Nova Crew.',
        'Conformément aux exigences de la Loi 25 du Québec, nous avons désigné un Responsable de la protection des renseignements personnels chargé de veiller au respect et à la mise en œuvre de nos pratiques de confidentialité :',
      ],
      contactBox: {
        organization: 'AI Nova Crew',
        dpoTitle: 'Responsable de la protection des renseignements personnels',
        email: 'ai.novacrew@gmail.com',
        serviceName: 'Plateforme BrainForge',
      },
    },
    {
      id: 'sec-definition',
      number: '03',
      title: 'Définition des renseignements personnels',
      content: [
        "Un renseignement personnel est une information concernant une personne physique qui permet de l'identifier directement ou indirectement (par exemple, un nom, une adresse courriel ou un identifiant numérique associé à un profil).",
      ],
    },
    {
      id: 'sec-collected',
      number: '04',
      title: 'Renseignements personnels collectés',
      content: [
        'AI Nova Crew veille au principe de collecte minimale. Nous collectons exclusivement les données nécessaires aux fonctionnalités réellement actives :',
      ],
      categories: [
        {
          name: 'Données de compte',
          items: [
            'Nom complet ou pseudonyme de joueur',
            'Adresse courriel valide',
            'Identifiant utilisateur unique (UUID)',
            'Préférence linguistique (FR / EN)',
            'Fuseau horaire pour le calendrier des défis',
          ],
        },
        {
          name: 'Données de jeu et progression',
          items: [
            'Défis joués et catégories cognitives',
            'Réponses fournies lors des sessions',
            'Scores, pourcentages et durées d’exécution en millisecondes',
            'Points d’expérience (XP) et niveau calculé',
            'Série active de jours consécutifs (Streak) et records personnels',
            'Badges débloqués (Achievements)',
            'Historique complet des entraînements',
          ],
        },
        {
          name: 'Données de communication',
          items: [
            'Nom transmis via le formulaire de contact',
            'Adresse courriel de correspondance',
            'Sujet et contenu du message envoyé',
          ],
        },
        {
          name: 'Informations techniques et de sécurité',
          items: [
            'Adresse IP (utilisée pour la limitation de débit et l’anti-abus)',
            'Type d’appareil, navigateur web et système d’exploitation',
            'Journaux techniques d’erreurs et d’événements de sécurité',
          ],
        },
      ],
    },
    {
      id: 'sec-purposes',
      number: '05',
      title: 'Pourquoi nous les collectons (Finalités de la collecte)',
      content: [
        'Les données recueillies sont destinées à des finalités légitimes, explicites et déterminées :',
      ],
      bullets: [
        'Création et gestion du compte : Authentification sécurisée, maintien de session et récupération de mot de passe.',
        'Fonctionnement du jeu et calcul cognitif : Évaluation des résultats, calcul des pourcentages de réussite et archivage de l’historique.',
        'Mécaniques de gamification : Attribution d’XP, gestion des passages de niveau, maintien du streak quotidien et octroi de badges d’accomplissement.',
        'Classement public (optionnel) : Affichage des scores hebdomadaires et globaux, uniquement si le joueur a activé sa visibilité dans ses préférences.',
        'Sécurité de la plateforme : Détection des tentatives de tricherie, limitation des requêtes abusives et protection contre la fraude.',
        'Support et assistance : Répondre avec exactitude aux demandes envoyées à ai.novacrew@gmail.com.',
        'Amélioration continue : Optimisation des performances techniques et de la fluidité des épreuves.',
      ],
    },
    {
      id: 'sec-consent',
      number: '06',
      title: 'Consentement & Bases légales',
      content: [
        'Le traitement de vos renseignements personnels repose, selon le contexte et le cadre juridique applicable, sur l’exécution du service demandé, le respect des obligations légales, les intérêts légitimes de sécurité reconnus par la loi, ou sur votre consentement explicite.',
        'Lorsque votre consentement est requis pour une fin spécifique et facultative (telle que l’apparition de votre profil dans le classement public), vous avez la liberté de l’accorder ou de le retirer à tout moment depuis les paramètres de votre compte.',
      ],
    },
    {
      id: 'sec-minimal',
      number: '07',
      title: 'Collecte minimale & Données exclues',
      content: [
        'AI Nova Crew s’abstient délibérément de collecter des données superflues ou intrusives. Nous ne collectons :',
      ],
      bullets: [
        'Aucune donnée médicale, psychologique ou de santé',
        'Aucune donnée biométrique',
        'Aucun renseignement financier ou bancaire non nécessaire',
        'Aucun renseignement sensible sans nécessité établie par la loi',
      ],
    },
    {
      id: 'sec-gaming-data',
      number: '08',
      title: 'Données de jeu & Avertissement strict sur l’absence de diagnostic',
      content: [
        'Les scores, réponses, temps de réaction, XP, niveaux et autres statistiques de jeu servent principalement au fonctionnement et à la personnalisation récréative de l’expérience BrainForge.',
      ],
      warningBox: {
        title: 'Avertissement important — Non-médicalité des résultats',
        text: 'Les résultats et statistiques BrainForge représentent des performances dans les jeux et défis interactifs de la plateforme. Ils ne constituent pas un diagnostic médical, psychologique, psychiatrique ou neuropsychologique et ne doivent en aucun cas être interprétés comme une mesure clinique de l’intelligence ou du QI.',
      },
    },
    {
      id: 'sec-profiling',
      number: '09',
      title: 'Profilage, tendances et fonctionnalités d’intelligence artificielle',
      content: [
        'BrainForge peut utiliser certaines données de performance afin d’identifier des tendances de jeu, par exemple les types de défis dans lesquels l’utilisateur obtient de meilleurs ou de moins bons résultats, afin de recommander des entraînements stimulants.',
        'Lorsque la loi l’exige (notamment sous le régime de la Loi 25 du Québec), AI Nova Crew informera expressément l’utilisateur lorsqu’une décision le concernant est fondée exclusivement sur un traitement automatisé et lui fournira les droits, explications et mécanismes de révision applicables.',
        'Aucune fonctionnalité d’IA prédictive n’est présentée comme active tant qu’elle n’est pas formellement déployée dans la version en cours de BrainForge.',
      ],
    },
    {
      id: 'sec-third-parties',
      number: '10',
      title: 'Communication à des tiers & Fournisseurs de services',
      content: [
        'AI Nova Crew ne vend, ne loue et ne commercialise aucun renseignement personnel à des fins publicitaires.',
        'Des fournisseurs de services technologiques réputés peuvent toutefois traiter des données pour notre compte afin d’assurer l’infrastructure de BrainForge :',
      ],
      bullets: [
        'Google OAuth : Authentification facultative rapide via compte Google.',
        'Hébergement infonuagique sécurisé : Hébergement de l’application et des bases de données.',
        'Prestataire de paiement certifié (ex. Stripe) : Lors de l’activation des abonnements payants, les transactions seront traitées directement par le tiers selon les normes PCI-DSS, sans que vos numéros de carte ne transitent par nos serveurs.',
      ],
    },
    {
      id: 'sec-transfers',
      number: '11',
      title: 'Transferts hors Québec et hors Canada',
      content: [
        'Certains fournisseurs technologiques d’infrastructure peuvent héberger ou traiter des renseignements personnels à l’extérieur du Québec ou du Canada.',
        'Pour les opérations visées par la législation québécoise, AI Nova Crew s’engage à procéder aux évaluations des facteurs relatifs à la vie privée (EFVP) requises par la Loi 25 afin de s’assurer que les données bénéficient d’une protection adéquate équivalente aux principes reconnus au Québec.',
      ],
    },
    {
      id: 'sec-security',
      number: '12',
      title: 'Mesures de sécurité raisonnables',
      content: [
        'AI Nova Crew met en œuvre des mesures de sécurité physiques, organisationnelles et technologiques raisonnables adaptées à la sensibilité des renseignements :',
      ],
      bullets: [
        'Chiffrement systématique de toutes les communications en transit (HTTPS / TLS 1.3).',
        'Mots de passe hachés cryptographiquement avec sel individuel (aucun mot de passe stocké en clair).',
        'Contrôle d’accès strict basé sur les rôles (RBAC) et partitionnement rigoureux des données par utilisateur.',
        'Protection anti-abus (champ piège honeypot invisible et limitation de débit) sur le formulaire de contact.',
        'Clés d’API et secrets d’application strictement cantonnés côté serveur.',
      ],
      note: 'AI Nova Crew met en œuvre des mesures de sécurité raisonnables adaptées à la nature et à la sensibilité des renseignements, sans toutefois pouvoir prétendre à une sécurité absolue invulnérable.',
    },
    {
      id: 'sec-retention',
      number: '13',
      title: 'Conservation et destruction des renseignements',
      content: [
        'AI Nova Crew conserve les renseignements personnels uniquement pendant la période nécessaire aux fins pour lesquelles ils ont été recueillis, sous réserve des obligations légales, contractuelles ou de sécurité applicables.',
        'En cas de suppression de compte par l’utilisateur, les données associées sont effacées ou anonymisées de façon irréversible, à l’exception des traces techniques strictement requises pour satisfaire aux obligations légales de preuve ou de sécurité.',
      ],
    },
    {
      id: 'sec-rights',
      number: '14',
      title: 'Vos droits (Accès, Rectification, Retrait)',
      content: [
        'Sous réserve des conditions prévues par la législation applicable, vous bénéficiez des droits suivants :',
      ],
      bullets: [
        'Droit d’accès : Consulter les renseignements personnels que nous détenons à votre sujet.',
        'Droit de rectification : Exiger la correction de renseignements inexacts, incomplets ou équivoques.',
        'Droit au retrait du consentement : Retirer votre accord à un traitement facultatif (ex. visibilité publique).',
        'Droit à l’effacement : Demander la suppression définitive de votre compte et de vos données associées.',
      ],
    },
    {
      id: 'sec-requests',
      number: '15',
      title: 'Procédure de demande d’accès ou de rectification',
      content: [
        'Pour exercer l’un de vos droits relatifs à vos renseignements personnels, il vous suffit de nous adresser une demande écrite par courriel :',
      ],
      contactAction: {
        email: 'ai.novacrew@gmail.com',
        subject: 'Demande — renseignements personnels',
        instructions:
          'AI Nova Crew procèdera à une vérification raisonnable de l’identité du demandeur avant de divulguer ou modifier des renseignements confidentiels, et répondra dans les délais prescrits par la loi.',
      },
    },
    {
      id: 'sec-incidents',
      number: '16',
      title: 'Gestion des incidents de confidentialité',
      content: [
        'En cas d’incident de confidentialité impliquant un renseignement personnel (accès, utilisation ou communication non autorisés), AI Nova Crew prend promptement les mesures raisonnables pour diminuer les risques de préjudice et procède à une évaluation de la situation.',
        'Lorsqu’un incident présente un risque de préjudice sérieux, les avis requis par la loi sont promptement transmis aux personnes concernées ainsi qu’à la Commission d’accès à l’information du Québec ou aux organismes de réglementation compétents. Un registre interne des incidents est rigoureusement tenu.',
      ],
    },
    {
      id: 'sec-cookies',
      number: '17',
      title: 'Témoins de connexion (Cookies) et stockage local',
      content: [
        'BrainForge utilise exclusivement des témoins et données de stockage local strictement essentiels au fonctionnement technique de la plateforme (jeton de session sécurisé, maintien de connexion, préférence linguistique FR/EN).',
        'Nous n’utilisons aucun témoin publicitaire tiers, aucun pixel de reciblage commercial et aucun traceur invasif.',
      ],
    },
    {
      id: 'sec-complaints',
      number: '18',
      title: 'Plaintes & Recours auprès des autorités',
      content: [
        'Toute question ou préoccupation concernant la protection de vos renseignements personnels peut d’abord être adressée à AI Nova Crew à l’adresse ai.novacrew@gmail.com.',
        'Si vous estimez que votre demande n’a pas été traitée de façon satisfaisante, vous avez la possibilité de vous adresser à l’autorité de contrôle compétente :',
        'Pour le Québec : Commission d’accès à l’information du Québec (CAI).',
        'Pour le Canada fédéral : Commissariat à la protection de la vie privée du Canada (CPVP).',
      ],
    },
    {
      id: 'sec-modifications',
      number: '19',
      title: 'Modifications de la présente politique',
      content: [
        'AI Nova Crew peut modifier la présente politique afin de refléter l’évolution de BrainForge, de ses pratiques ou des exigences légales.',
        'Pour les modifications substantielles, les utilisateurs seront informés conformément aux exigences légales applicables (par exemple par avis sur la plateforme ou courriel).',
      ],
    },
  ],
  disclaimer: {
    title: 'Avis important',
    text:
      'Ces documents sont destinés à présenter les règles et pratiques applicables à l’utilisation de BrainForge. Ils ne constituent pas un avis juridique. AI Nova Crew devrait faire valider ces documents par un professionnel du droit avant le lancement commercial du service, particulièrement avant l’activation des paiements, des abonnements et du traitement de données à grande échelle.',
  },
};
