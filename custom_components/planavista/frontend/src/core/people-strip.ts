/**
 * Whose view a people strip opens on (milestone 8, spec 3.6): the person
 * someone picked while they're still there, else the account's own person
 * (Casey's phone opens on Casey), else the first person.
 */
export function stripStart(ids: readonly string[], chosen: string | null, own: string | null): string | null {
  if (chosen && ids.includes(chosen)) return chosen;
  if (own && ids.includes(own)) return own;
  return ids[0] ?? null;
}
