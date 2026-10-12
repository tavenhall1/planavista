/**
 * A picture for a chore or an event from its name (spec 13.4, 13.8): what a
 * young child sees on a tile, and what quick add picks for a new chore until
 * a parent chooses another in the chore editor. Presentation only.
 */
const WORDS: Array<[RegExp, string]> = [
  [/\b(trash|garbage|bins?|recycling)\b/i, '🗑️'],
  [/\b(dish(es)?|dishwasher)\b/i, '🍽️'],
  [/\b(laundry|clothes|fold)\b/i, '🧺'],
  [/\bbeds?\b/i, '🛏️'],
  [/\btoys?\b/i, '🧸'],
  [/\bfish\b/i, '🐠'],
  [/\bcats?\b/i, '🐱'],
  [/\b(dogs?|walk the dog)\b/i, '🐕'],
  [/\b(pets?|feed)\b/i, '🐾'],
  [/\btable\b/i, '🍴'],
  [/\b(vacuum|sweep|mop|floors?)\b/i, '🧹'],
  [/\b(bath(room)?|toilet|shower|tub)\b/i, '🛁'],
  [/\b(leaf|leaves|rake)\b/i, '🍂'],
  [/\b(yard|garden|lawn|weeds?|mow)\b/i, '🌿'],
  [/\b(grocer(y|ies)|shopping|shop)\b/i, '🛒'],
  [/\b(plants?|flowers?)\b/i, '🪴'],
  [/\bcar\b/i, '🚗'],
  [/\b(garage|boxes|closet|attic|basement)\b/i, '📦'],
  [/\b(cook|dinner|lunch|breakfast|meal)\b/i, '🍳'],
  [/\b(homework|study|reading|read)\b/i, '📚'],
  [/\b(teeth|toothbrush)\b/i, '🪥'],
  [/\b(fix|repair|latch)\b/i, '🔨'],
  [/\bfilters?\b/i, '🔧'],
  [/\b(budget|bills?|finance|money)\b/i, '💵'],
  [/\b(windows?|dust|tidy|clean)\b/i, '✨'],
  [/\b(swim(ming)?|pool)\b/i, '🏊'],
  [/\b(soccer|football)\b/i, '⚽'],
  [/\bbasketball\b/i, '🏀'],
  [/\bbaseball\b/i, '⚾'],
  [/\b(school|class)\b/i, '🏫'],
  [/\bdentist\b/i, '🦷'],
  [/\b(doctor|checkup)\b/i, '🩺'],
  [/\b(piano|music|guitar|violin|band)\b/i, '🎹'],
  [/\b(dance|ballet)\b/i, '🩰'],
  [/\b(birthday|party)\b/i, '🎉'],
  [/\bpizza\b/i, '🍕'],
  [/\bmovies?\b/i, '🎬'],
  [/\b(practice|game|match|training)\b/i, '🏅'],
  [/\b(meeting|work|standup)\b/i, '💼'],
  [/\b(trip|travel|flight)\b/i, '🧳'],
  [/\b(bus)\b/i, '🚌'],
  [/\b(drop-off|pick-?up)\b/i, '🚗'],
  [/\b(church|temple|mosque)\b/i, '⛪'],
  [/\b(study group|tutor)\b/i, '📚'],
];

export function pictureFor(text: string, fallback = '⭐'): string {
  for (const [pattern, picture] of WORDS) {
    if (pattern.test(text)) return picture;
  }
  return fallback;
}

/**
 * A chore's picture: the one a parent chose, else one from its name, as the
 * chore editor's "From the name" shows (imported and spoken chores have none).
 */
export function chorePicture(icon: string | null | undefined, name: string): string {
  return icon && !icon.startsWith('mdi:') ? icon : pictureFor(name);
}
