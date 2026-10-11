/**
 * Stars per check-off (spec 8.3): the chore's own number when it has one,
 * otherwise 1 per `minutesPerStar` minutes, rounded half up, and at least 1.
 * The engine uses the same formula; both are checked against
 * tests/fixtures/chores_stars.json, so the worth a parent sees while adding
 * a chore is what the board awards.
 */
export function starsFor(creditMinutes: number, minutesPerStar: number, override?: number | null): number {
  if (override !== undefined && override !== null) return Math.trunc(override);
  // A hair over the half, so 37.5 / 15 = 2.4999999... still rounds up.
  return Math.max(1, Math.floor(creditMinutes / minutesPerStar + 0.5 + 1e-9));
}

/** "1 per 15 minutes" (quick add's worth line). */
export function perStarText(minutesPerStar: number): string {
  return minutesPerStar === 1 ? '1 per minute' : `1 per ${minutesPerStar} minutes`;
}
