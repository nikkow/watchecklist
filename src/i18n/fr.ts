import type { Dictionary } from './en';

export const fr: Dictionary = {
  meta: {
    description:
      'Regardez chaque épisode et chaque film d’un univers partagé dans le bon ordre. Chaque crossover, chaque épisode, sans spoiler.',
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
    title: 'Dans l’ordre.',
    subtitle: 'Chaque crossover, chaque épisode, sans spoiler.',
    intro:
      'Des ordres de visionnage édités à la main pour les univers partagés, films compris. Cochez au fur et à mesure, sans compte.',
    listsTitle: 'Listes',
    listsEmpty: 'Les premiers ordres de visionnage sont en cours d’édition.',
    suggestList: 'Proposer une liste sur GitHub',
  },
  about: {
    title: 'À propos',
    intro:
      'watchecklist est une checklist gratuite pour regarder les épisodes et les films d’un univers partagé dans le bon ordre, crossovers compris.',
    privacyTitle: 'Sans compte, sans pistage',
    privacy:
      'Votre progression est enregistrée uniquement dans ce navigateur. Pas de compte, pas de mesure d’audience, pas de traceur.',
    dataTitle: 'Sources des données',
    data: 'Les ordres de visionnage sont édités à la main et publiés sous CC BY-SA 4.0. Les titres, dates et images viennent de TMDB.',
    tmdbLink: 'The Movie Database (TMDB)',
    codeTitle: 'Code ouvert',
    code: 'Le code est publié sous licence MIT.',
  },
  list: {
    backToLists: 'Retour aux listes',
    series: (count: number) => `${count} ${count === 1 ? 'série' : 'séries'}`,
    crossovers: (count: number) => `${count} ${count === 1 ? 'crossover' : 'crossovers'}`,
    episodes: (count: number) => `${count} ${count === 1 ? 'épisode' : 'épisodes'}`,
    movies: (count: number) => `${count} ${count === 1 ? 'film' : 'films'}`,
    years: (from: string, to: string) => (from === to ? from : `${from} à ${to}`),
    progress: 'Progression',
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
  footer: {
    localProgress: 'Gratuit et sans compte : votre progression reste sur cet appareil.',
    tmdbNotice:
      'Images et données : TMDB. Ce produit utilise l’API TMDB mais n’est ni approuvé ni certifié par TMDB.',
    licences: 'Listes CC BY-SA 4.0, code MIT.',
    nav: 'Pied de page',
    suggestList: 'Proposer une liste sur GitHub',
    about: 'À propos',
    sourceCode: 'Code source sur GitHub',
  },
};
