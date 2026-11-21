import type { Dictionary } from './en';

export const fr: Dictionary = {
  meta: {
    title: 'watchecklist : ordres de visionnage des univers partagés',
    description:
      "Regardez chaque épisode et chaque film d'un univers partagé dans le bon ordre. Chaque crossover, chaque épisode, sans spoiler.",
  },
  language: {
    name: 'Français',
    code: 'FR',
    menuLabel: 'Langue',
    current: 'Langue : Français',
  },
  header: {
    home: 'watchecklist, accueil',
    openMenu: 'Ouvrir le menu',
    primaryNav: 'Principale',
    lists: 'Listes',
    about: 'À propos',
  },
  home: {
    title: "Dans l'ordre.",
    subtitle: 'Chaque crossover, chaque épisode, sans spoiler.',
    intro:
      'Des ordres de visionnage édités à la main pour les univers partagés, films compris. Cochez au fur et à mesure, sans compte.',
    listsTitle: 'Listes',
    listsEmpty: "Les premiers ordres de visionnage sont en cours d'édition.",
    suggestList: 'Proposer une liste sur GitHub',
  },
  about: {
    title: 'À propos',
    description:
      "Qui fait watchecklist, comment votre progression reste sur votre appareil, d'où viennent les ordres de visionnage et les données TMDB.",
    intro:
      "watchecklist est une checklist gratuite pour regarder les épisodes et les films d'un univers partagé dans le bon ordre, crossovers compris.",
    privacyTitle: 'Sans compte, sans cookie',
    privacy:
      'Votre progression est enregistrée uniquement dans ce navigateur. Pas de compte, pas de cookie.',
    stats:
      "Les visites sont comptées de façon anonyme avec une instance de Matomo hébergée par Keiko, une startup française appartenant à l'auteur du site : pas de cookie, pas d'identifiant de visiteur, adresse IP masquée, données conservées 25 mois au plus, jamais partagées.",
    statsChoice: 'Compter mes visites dans les statistiques anonymes',
    dataTitle: 'Sources des données',
    data: 'Les ordres de visionnage sont édités à la main et publiés sous CC BY-SA 4.0. Les titres, dates et images viennent de TMDB.',
    tmdbLink: 'The Movie Database (TMDB)',
    codeTitle: 'Code ouvert',
    code: 'Le code est publié sous licence MIT.',
  },
  list: {
    backToLists: 'Retour aux listes',
    metaTitle: (name: string) => `${name} : ordre de visionnage sans spoiler`,
    watchOrder: 'ordre de visionnage',
    series: (count: number) => `${count} ${count === 1 ? 'série' : 'séries'}`,
    crossovers: (count: number) => `${count} ${count === 1 ? 'crossover' : 'crossovers'}`,
    episodes: (count: number) => `${count} ${count === 1 ? 'épisode' : 'épisodes'}`,
    movies: (count: number) => `${count} ${count === 1 ? 'film' : 'films'}`,
    years: (from: string, to: string) => (from === to ? from : `${from} à ${to}`),
    progress: 'Progression',
    factsTitle: 'En bref',
    watchTimeLabel: 'Durée',
    watchTime: (hours: number) =>
      `Environ ${hours.toLocaleString('fr')} ${hours === 1 ? 'heure' : 'heures'}`,
    essentialsLabel: 'Essentiels seulement',
    essentials: (count: number, hours: number | null) =>
      hours === null
        ? `${count.toLocaleString('fr')} à voir`
        : `${count.toLocaleString('fr')} à voir, environ ${hours.toLocaleString('fr')} ${hours === 1 ? 'heure' : 'heures'}`,
    startLabel: 'Commencer par',
    nextUp: 'À voir ensuite',
    markWatched: 'Marquer comme vu',
    allWatched: 'Tout est vu. Il ne reste rien dans cette liste.',
    crossoverHeader: (name: string, count: number) =>
      `Crossover ${name} · ${count} épisodes à enchaîner`,
    crossoverNext: (part: number, parts: number, name: string, next: string) =>
      `Partie ${part} sur ${parts} du crossover ${name} : enchaînez avec ${next}.`,
    crossoverLast: (name: string) => `Dernière partie du crossover ${name}.`,
    importance: { essential: 'Essentiel', recommended: 'Recommandé', optional: 'Optionnel' },
    movie: 'Film',
    filters: 'Filtres',
    seriesFilter: 'Séries',
    importanceFilter: 'Importance',
    showAll: 'Tout',
    withoutOptional: 'Sans optionnels',
    essentialOnly: 'Essentiels',
    hideWatched: 'Masquer les vus',
    showTitles: 'Afficher les titres',
    crossoverMap: 'Crossovers',
    crossoversOnly: 'Crossovers uniquement',
    noMatch: 'Rien avec ces filtres.',
    curatedBy: 'Mise à jour par',
    authors: 'Liste de',
    githubProfile: (handle: string) => `${handle} sur GitHub`,
    storageUnavailable:
      'Ce navigateur ne garde pas de données pour ce site : votre progression sera perdue en le quittant.',
  },
  notFound: {
    title: 'Page introuvable',
    body: "Cette page n'existe pas ou a changé d'adresse.",
    home: 'Retour aux listes',
  },
  install: {
    title: 'Installer watchecklist',
    body: "Ouvrez vos listes depuis l'écran d'accueil et cochez même hors ligne.",
    iosSteps: "Dans Safari, touchez Partager, puis Sur l'écran d'accueil.",
    button: "Installer l'app",
    dismiss: 'Plus tard',
  },
  footer: {
    localProgress: 'Gratuit et sans compte : votre progression reste sur cet appareil.',
    tmdbNotice:
      "Images et données : TMDB. Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.",
    licences: 'Listes CC BY-SA 4.0, code MIT.',
    nav: 'Pied de page',
    suggestList: 'Proposer une liste sur GitHub',
    about: 'À propos',
    sourceCode: 'Code source sur GitHub',
  },
};
