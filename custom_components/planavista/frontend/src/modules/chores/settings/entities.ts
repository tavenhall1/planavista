import type { Member } from '../../../core/household';

/** A person's chores entities (spec 10.2), as Use in automations lists them. */
export interface MemberEntity {
  label: string;
  entity_id: string;
}

/** What each entity is named after its device ("Casey Chores left"), and the id it starts with. */
const ENTITIES: Array<{ label: string; domain: string; name: string; suffix: string }> = [
  { label: 'To-do list', domain: 'todo', name: 'Chores', suffix: 'chores' },
  { label: 'Chores left today', domain: 'sensor', name: 'Chores left', suffix: 'chores_left' },
  { label: 'Stars', domain: 'sensor', name: 'Stars', suffix: 'stars' },
  { label: 'Done for today', domain: 'binary_sensor', name: 'Chores done', suffix: 'chores_done' },
  { label: 'Events', domain: 'event', name: 'Chores', suffix: 'chores' },
];

type States = Record<string, { attributes?: { friendly_name?: unknown } } | undefined>;

/**
 * The entity ids Home Assistant gave a person's chores entities: found by
 * their names (the device is named after the person), else the ids they
 * were made with. Renaming a person keeps the ids (spec 10.1).
 */
export function memberEntities(states: States | undefined, member: Pick<Member, 'id' | 'name'>): MemberEntity[] {
  const all = Object.keys(states ?? {});
  return ENTITIES.map(({ label, domain, name, suffix }) => {
    const wanted = `${member.name} ${name}`.toLocaleLowerCase();
    const found = all.find(id => id.startsWith(`${domain}.`)
      && String(states?.[id]?.attributes?.friendly_name ?? '').toLocaleLowerCase() === wanted);
    return { label, entity_id: found ?? `${domain}.${member.id}_${suffix}` };
  });
}
