import { Member, MemberChanges, Role, roleFields, roleOf } from './household';

export interface PersonRow {
  key: string;
  name: string;
  person: string | null;
  memberId: string | null;
  role: Role;
  checked: boolean;
}

export interface HaPerson {
  entity_id: string;
  name: string;
  user_id?: string | null;
}

/** "Who lives here?": the household first, then Home Assistant people who aren't in it yet. */
export function setupRows(members: Member[], persons: HaPerson[], currentUserId: string | null): PersonRow[] {
  const rows: PersonRow[] = members.map(m => ({
    key: m.id, name: m.name, person: m.person, memberId: m.id, role: roleOf(m), checked: true,
  }));
  for (const person of persons) {
    if (members.some(m => m.person === person.entity_id)) continue;
    const isYou = !!currentUserId && person.user_id === currentUserId;
    rows.push({
      key: person.entity_id, name: person.name, person: person.entity_id, memberId: null,
      role: isYou ? 'parent' : 'adult', checked: true,
    });
  }
  return rows;
}

/** Someone without Home Assistant, added by name. */
export function addedRow(name: string, index: number): PersonRow {
  return { key: `new:${index}`, name: name.trim(), person: null, memberId: null, role: 'adult', checked: true };
}

export interface SetupPlan {
  add: MemberChanges[];
  update: Array<{ id: string; changes: MemberChanges }>;
  remove: string[];
}

/** What Next does: add checked newcomers, change roles that changed, remove people who were unchecked. */
export function setupPlan(rows: PersonRow[], members: Member[]): SetupPlan {
  const plan: SetupPlan = { add: [], update: [], remove: [] };
  for (const row of rows) {
    const member = row.memberId ? members.find(m => m.id === row.memberId) : undefined;
    if (member) {
      if (!row.checked) plan.remove.push(member.id);
      else if (row.role !== roleOf(member)) plan.update.push({ id: member.id, changes: roleFields(row.role) });
    } else if (row.checked && row.name.trim()) {
      plan.add.push({ name: row.name.trim(), ...roleFields(row.role), ...(row.person ? { person: row.person } : {}) });
    }
  }
  return plan;
}
