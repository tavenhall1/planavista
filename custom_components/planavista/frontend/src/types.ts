import { HomeAssistant } from 'custom-card-helpers';

// ============================================================================
// Configuration Types
// ============================================================================

export interface PlanaVistaCardConfig {
  type: string;
  entity?: string;
  theme?: string;
  view?: 'day' | 'week' | 'month' | 'agenda';
  // Card-level YAML overrides (fall back to global sensor config)
  default_view?: 'day' | 'week' | 'month' | 'agenda';
  calendars?: string[];       // entity_id filter list — show only these
  hide_weather?: boolean;
  hide_header?: boolean;
  weather_entity?: string;
  time_format?: '12h' | '24h';
  first_day?: 'monday' | 'sunday';
}

export interface PlanaVistaGridConfig extends PlanaVistaCardConfig {
  view?: 'day' | 'week' | 'month' | 'agenda';
}

export interface PlanaVistaClockConfig extends PlanaVistaCardConfig {
  size?: 'small' | 'medium' | 'large';
  show_date?: boolean;
  show_seconds?: boolean;
  time_format?: '12h' | '24h';
  align?: 'left' | 'center' | 'right';
  background?: string;
  text_color?: string;
}

export interface PlanaVistaWeatherConfig extends PlanaVistaCardConfig {
  weather_entity?: string;
  show_details?: boolean;
  show_forecast?: boolean;
  layout?: 'horizontal' | 'vertical';
  background?: string;
  text_color?: string;
}

export interface PlanaVistaTogglesConfig extends PlanaVistaCardConfig {
  layout?: 'horizontal' | 'vertical';
  show_names?: boolean;
  show_add_button?: boolean;
}

export interface PlanaVistaAgendaConfig extends PlanaVistaCardConfig {
  max_events?: number;
  days_ahead?: number;
  max_height?: string;
  show_calendar_name?: boolean;
  show_end_time?: boolean;
  time_format?: '12h' | '24h';
}

// ============================================================================
// Data Types
// ============================================================================

export interface CalendarConfig {
  entity_id: string;
  display_name: string;
  color: string;
  color_light: string;
  icon: string;
  person_entity: string;
  visible: boolean;
  state?: string;
  attributes?: Record<string, any>;
}

export interface CalendarEvent {
  summary: string;
  start: string;       // ISO datetime
  end: string;         // ISO datetime
  description?: string;
  location?: string;
  uid?: string;        // For delete/edit operations
  recurrence_id?: string;
  calendar_entity_id: string;
  calendar_name: string;
  calendar_color: string;
  calendar_color_light: string;
}

export interface ThemeOverrides {
  accent?: string;            // hex color for accent
  background?: string;        // hex color for bg override
  header_style?: string;      // preset key: 'gradient_purple' | 'gradient_teal' | 'gradient_sunset' | 'solid_accent' | 'solid_dark' | 'custom'
  header_custom?: string;     // hex color (only used when header_style='custom')
  corner_style?: string;      // 'sharp' | 'rounded' | 'pill'
  shadow_depth?: string;      // 'none' | 'subtle' | 'bold'
}

export interface DisplayConfig {
  time_format: '12h' | '24h';
  weather_entity: string;
  first_day: 'monday' | 'sunday';
  default_view: 'day' | 'week' | 'month' | 'agenda';
  theme: string;
  theme_overrides?: ThemeOverrides;
}

export interface PlanaVistaData {
  calendars: CalendarConfig[];
  events: CalendarEvent[];
  display: DisplayConfig;
  onboarding_complete?: boolean;
  version?: number;
}

// ============================================================================
// State Types
// ============================================================================

export type ViewType = 'day' | 'week' | 'month' | 'agenda';
export type DialogType = 'create' | 'edit' | null;

export interface PlanaVistaState {
  hiddenCalendars: Set<string>;
  currentView: ViewType;
  currentDate: Date;
  selectedEvent: CalendarEvent | null;
  dialogOpen: DialogType;
}

// ============================================================================
// Event Creation
// ============================================================================

export interface CreateEventData {
  entity_id: string;
  summary: string;
  start_date_time?: string;
  end_date_time?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  location?: string;
}

export interface DeleteEventData {
  entity_id: string;
  uid: string;
  recurrence_id?: string;
}

// ============================================================================
// Weather Types
// ============================================================================

export type WeatherCondition =
  | 'clear-night'
  | 'cloudy'
  | 'fog'
  | 'hail'
  | 'lightning'
  | 'lightning-rainy'
  | 'partlycloudy'
  | 'pouring'
  | 'rainy'
  | 'snowy'
  | 'snowy-rainy'
  | 'sunny'
  | 'windy'
  | 'windy-variant'
  | 'exceptional';

export interface ForecastDay {
  datetime: string;
  condition: WeatherCondition;
  temperature: number;
  templow?: number;
}

// ============================================================================
// Window augmentation for HA
// ============================================================================

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
    }>;
    _planavistaState?: any;
  }
}
