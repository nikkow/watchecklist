/** A list id once parsed: an episode, a show (list covers only) or a movie. */
export type ParsedId =
  | { type: 'episode'; showId: number; season: number; episode: number }
  | { type: 'show'; showId: number }
  | { type: 'movie'; movieId: number };
