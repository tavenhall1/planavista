import { HomeAssistant } from 'custom-card-helpers';
import { CreateEventData, DeleteEventData, PlanaVistaData, CalendarConfig } from '../types';

/**
 * Create a calendar event via HA service.
 */
export async function createEvent(hass: HomeAssistant, data: CreateEventData): Promise<void> {
  const serviceData: Record<string, any> = {
    summary: data.summary,
  };

  if (data.start_date_time) serviceData.start_date_time = data.start_date_time;
  if (data.end_date_time) serviceData.end_date_time = data.end_date_time;
  if (data.start_date) serviceData.start_date = data.start_date;
  if (data.end_date) serviceData.end_date = data.end_date;
  if (data.description) serviceData.description = data.description;
  if (data.location) serviceData.location = data.location;

  await hass.callService('calendar', 'create_event', serviceData, { entity_id: data.entity_id });
}

/**
 * Delete a calendar event via HA service.
 */
export async function deleteEvent(hass: HomeAssistant, data: DeleteEventData): Promise<void> {
  const serviceData: Record<string, any> = {
    uid: data.uid,
  };
  if (data.recurrence_id) serviceData.recurrence_id = data.recurrence_id;

  await hass.callService('calendar', 'delete_event', serviceData, { entity_id: data.entity_id });
}

/**
 * Trigger a refresh of the PlanaVista coordinator.
 */
export async function refreshPlanaVista(hass: HomeAssistant, entityId = 'sensor.planavista_config'): Promise<void> {
  await hass.callService('homeassistant', 'update_entity', { entity_id: entityId });
}

/**
 * Extract PlanaVistaData from sensor attributes.
 */
export function getPlanaVistaData(hass: HomeAssistant, entityId = 'sensor.planavista_config'): PlanaVistaData | null {
  const entity = hass.states[entityId];
  if (!entity) return null;

  const attrs = entity.attributes as any;
  const events = attrs.events || [];

  // Diagnostic: log uid presence on first load for debugging edit/delete
  if (events.length > 0 && !(getPlanaVistaData as any)._uidLogged) {
    (getPlanaVistaData as any)._uidLogged = true;
    const withUid = events.filter((e: any) => e.uid);
    const withoutUid = events.filter((e: any) => !e.uid);
    console.log(
      `[PlanaVista] Event UID check: ${withUid.length} with uid, ${withoutUid.length} without uid (total ${events.length})`,
    );
    if (withoutUid.length > 0) {
      console.log('[PlanaVista] Events missing uid:', withoutUid.slice(0, 3).map((e: any) => ({
        summary: e.summary,
        keys: Object.keys(e),
      })));
    }
  }

  return {
    calendars: attrs.calendars || [],
    events,
    display: attrs.display || {
      time_format: '12h',
      weather_entity: '',
      first_day: 'sunday',
      default_view: 'day',
      theme: 'light',
    },
    onboarding_complete: attrs.onboarding_complete,
    version: attrs.version,
  };
}

/**
 * Get a person entity's avatar URL.
 */
export function getPersonAvatar(hass: HomeAssistant, personEntityId: string): string | null {
  if (!personEntityId) return null;
  const entity = hass.states[personEntityId];
  return entity?.attributes?.entity_picture || null;
}

/**
 * Get the friendly name of a person entity.
 */
export function getPersonName(hass: HomeAssistant, personEntityId: string): string {
  if (!personEntityId) return '';
  const entity = hass.states[personEntityId];
  return entity?.attributes?.friendly_name || personEntityId.replace('person.', '');
}
