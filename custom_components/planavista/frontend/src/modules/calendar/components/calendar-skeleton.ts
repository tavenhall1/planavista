import { css, html, TemplateResult } from 'lit';
import type { ViewType } from '../../../types';
import type { Layout } from '../../../core/layout';

/** Where each lane's placeholder blocks sit, as top and height in percent of the day. */
const LANE_BLOCKS: Array<Array<[number, number]>> = [
  [[8, 9], [34, 6], [62, 12]],
  [[18, 12], [52, 8]],
  [[4, 6], [28, 14], [70, 8]],
];

/** Placeholder chips per day card or Month cell, repeating. */
const CHIPS = [2, 1, 0, 3, 1, 2, 0];

/**
 * The calendar's skeletons (spec 11.6: skeletons, not spinners): the shape
 * of the view that's loading, in neutral bones, so nothing jumps when the
 * events arrive.
 */
export function calendarSkeleton(view: ViewType, layout: Layout, people: number): TemplateResult {
  const lanes = Math.max(1, Math.min(4, people || 3));
  switch (view) {
    case 'week': {
      const cards = layout === 'phone' ? 3 : layout === 'portrait' ? 6 : 8;
      return html`
        <div class="skeleton skeleton-week" aria-busy="true" aria-label="Loading the calendar">
          ${Array.from({ length: cards }, (_, i) => html`
            <div class="bone-card">
              <div class="bone" style="width: 45%; height: 16px"></div>
              ${Array.from({ length: CHIPS[i % CHIPS.length] }, () => html`<div class="bone" style="height: 44px"></div>`)}
            </div>
          `)}
        </div>
      `;
    }
    case 'month':
      return html`
        <div class="skeleton skeleton-month" aria-busy="true" aria-label="Loading the calendar">
          ${Array.from({ length: 35 }, (_, i) => html`
            <div class="bone-cell">
              <div class="bone round" style="width: 18px; height: 18px"></div>
              ${Array.from({ length: Math.min(2, CHIPS[i % CHIPS.length]) }, () => html`<div class="bone" style="height: 14px"></div>`)}
            </div>
          `)}
        </div>
      `;
    case 'agenda':
      return html`
        <div class="skeleton skeleton-agenda" aria-busy="true" aria-label="Loading the calendar">
          ${[2, 1, 3, 1].map(rows => html`
            <div class="bone-card">
              <div class="bone" style="width: 30%; height: 18px"></div>
              ${Array.from({ length: rows }, () => html`<div class="bone" style="height: 48px"></div>`)}
            </div>
          `)}
        </div>
      `;
    default:
      return html`
        <div class="skeleton skeleton-day" aria-busy="true" aria-label="Loading the calendar">
          <div class="bone-heads">
            ${Array.from({ length: lanes }, () => html`
              <div class="bone-head"><div class="bone round" style="width: 48px; height: 48px"></div><div class="bone" style="width: 56px; height: 12px"></div></div>
            `)}
          </div>
          <div class="bone-lanes">
            ${Array.from({ length: lanes }, (_, i) => html`
              <div class="bone-lane">
                ${LANE_BLOCKS[i % LANE_BLOCKS.length].map(([top, height]) => html`
                  <div class="bone" style="top: ${top}%; height: ${height}%"></div>
                `)}
              </div>
            `)}
          </div>
        </div>
      `;
  }
}

export const skeletonStyles = css`
  .skeleton {
    box-sizing: border-box;
    height: 100%;
    padding: 12px 16px;
    overflow: hidden;
  }

  .skeleton-week {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: min-content;
    gap: 12px;
  }

  :host([layout='portrait']) .skeleton-week {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :host([layout='phone']) .skeleton-week {
    grid-template-columns: minmax(0, 1fr);
  }

  .bone-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
    padding: 12px;
    border: 1px solid var(--pv-border-subtle, #F1F1EE);
    border-radius: var(--pv-radius, 12px);
  }

  .skeleton-agenda {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 800px;
    margin: 0 auto;
  }

  .skeleton-agenda .bone-card {
    min-height: 0;
  }

  .skeleton-month {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(5, minmax(0, 1fr));
    gap: 1px;
    padding: 0;
  }

  .bone-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border: 1px solid var(--pv-border-subtle, #F1F1EE);
  }

  .skeleton-day {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bone-heads,
  .bone-lanes {
    display: flex;
    gap: 12px;
    padding-left: 48px;
  }

  .bone-head {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .bone-lanes {
    flex: 1 1 auto;
  }

  .bone-lane {
    position: relative;
    flex: 1 1 0;
  }

  .bone-lane .bone {
    position: absolute;
    left: 0;
    right: 0;
  }
`;
