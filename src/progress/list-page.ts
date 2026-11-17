import type { Importance } from '../lists/schema.ts';
import { storageKey } from './constants.ts';
import { isVisible, nextRow } from './list-logic.ts';
import type { Filters, ImportanceFilter, Row } from './list-types.ts';
import {
  emptyProgress,
  loadProgress,
  saveProgress,
  setWatched,
  type ProgressStorage,
} from './store.ts';

/**
 * Brings a pre-rendered list page to life: ticks stored in `localStorage`, filters, progress
 * and the next-up card. Does nothing on pages without a list.
 */
export function startListPage(): void {
  const root = document.querySelector<HTMLElement>('[data-list]');
  if (!root) return;

  const items = [...root.querySelectorAll<HTMLLIElement>('[data-item]')];
  const rows: Row[] = items.map((item) => ({
    id: item.dataset['item'] ?? '',
    series: item.dataset['series'] ?? '',
    importance: (item.dataset['importance'] ?? 'essential') as Importance,
    crossover: item.hasAttribute('data-in-crossover'),
  }));
  const storage = browserStorage();
  let progress = storage ? loadProgress(storage) : emptyProgress();
  const hiddenSeries = new Set<string>();
  const filters: Filters = {
    importance: 'all',
    hiddenSeries,
    hideWatched: false,
    crossoversOnly: false,
  };
  const isWatched = (id: string) => progress.watched[id] === true;
  const warning = root.querySelector<HTMLElement>('[data-storage-warning]');
  if (warning) warning.hidden = storage !== null;

  function toggle(id: string, watched: boolean): void {
    progress = setWatched(progress, id, watched);
    if (storage && !saveProgress(storage, progress) && warning) warning.hidden = false;
    render();
  }

  function render(): void {
    const next = nextRow(rows, isWatched);
    items.forEach((item, index) => {
      const row = rows[index] as Row;
      const watched = isWatched(row.id);
      item.querySelector('.list-row-check')?.setAttribute('aria-pressed', String(watched));
      item.hidden = !isVisible(row, filters, watched);
      item.toggleAttribute('data-next', row.id === next?.id);
    });
    for (const group of root?.querySelectorAll<HTMLElement>('[data-crossover]') ?? []) {
      group.hidden = [...group.querySelectorAll<HTMLElement>('[data-item]')].every((i) => i.hidden);
    }
    let anyVisible = false;
    for (const section of sections()) {
      const own = [...section.querySelectorAll<HTMLElement>('[data-item]')];
      const watched = own.filter((item) => isWatched(item.dataset['item'] ?? '')).length;
      setText(section.querySelector('[data-section-count]'), `${watched} / ${own.length}`);
      // A section the filters empty disappears, so filtered views stay short.
      section.hidden = own.every((item) => item.hidden);
      anyVisible ||= !section.hidden;
    }
    const noMatch = root?.querySelector<HTMLElement>('[data-no-match]');
    if (noMatch) noMatch.hidden = anyVisible;
    renderProgress();
    renderNext(next);
  }

  function renderProgress(): void {
    const watched = rows.filter((row) => isWatched(row.id)).length;
    const bar = root?.querySelector<HTMLElement>('[data-progress]');
    bar?.style.setProperty('--progress', `${(watched / Math.max(rows.length, 1)) * 100}%`);
    bar?.setAttribute('aria-valuenow', String(watched));
    setText(root?.querySelector('[data-progress-label]') ?? null, `${watched} / ${rows.length}`);
  }

  function renderNext(next: Row | null): void {
    const card = root?.querySelector<HTMLElement>('[data-next-card]');
    const done = root?.querySelector<HTMLElement>('[data-all-watched]');
    if (!card || !done) return;
    card.hidden = next === null;
    done.hidden = next !== null;
    const item = next && items[rows.indexOf(next)];
    if (!item) return;
    setText(card.querySelector('[data-next-name]'), item.dataset['name'] ?? '');
    const hint = card.querySelector<HTMLElement>('[data-next-hint]');
    if (hint) {
      hint.textContent = item.dataset['hint'] ?? '';
      hint.hidden = !item.dataset['hint'];
    }
    const poster = card.querySelector<HTMLImageElement>('img[data-next-poster]');
    const source = item.querySelector<HTMLImageElement>('img.list-row-poster');
    if (poster && source) {
      poster.srcset = source.srcset;
      poster.src = source.src;
    }
  }

  root.addEventListener('click', (event) => {
    const target = event.target as Element;
    const check = target.closest('.list-row-check');
    const item = check?.closest<HTMLElement>('[data-item]');
    if (item) {
      const id = item.dataset['item'] ?? '';
      toggle(id, !isWatched(id));
      return;
    }
    if (target.closest('[data-next-mark]')) {
      const next = nextRow(rows, isWatched);
      if (next) toggle(next.id, true);
      return;
    }
    const series = target.closest<HTMLElement>('[data-series-filter]');
    if (series) {
      const key = series.dataset['seriesFilter'] ?? '';
      const shown = hiddenSeries.has(key);
      if (shown) hiddenSeries.delete(key);
      else hiddenSeries.add(key);
      series.setAttribute('aria-pressed', String(shown));
      render();
      return;
    }
    const importance = target.closest<HTMLElement>('[data-importance-filter]');
    if (importance) {
      filters.importance = (importance.dataset['importanceFilter'] ?? 'all') as ImportanceFilter;
      for (const button of root.querySelectorAll('[data-importance-filter]')) {
        button.setAttribute('aria-pressed', String(button === importance));
      }
      render();
      return;
    }
    const toggleSwitch = target.closest<HTMLElement>('[data-switch]');
    const key = toggleSwitch?.dataset['switch'];
    if (toggleSwitch && (key === 'hideWatched' || key === 'crossoversOnly')) {
      filters[key] = !filters[key];
      toggleSwitch.setAttribute('aria-pressed', String(filters[key]));
      render();
      // Crossovers sit in many sections: open those left so the blocks show at once.
      if (key === 'crossoversOnly' && filters.crossoversOnly) {
        for (const section of sections()) if (!section.hidden) section.open = true;
      }
    }
  });

  // Another tab ticked something: follow it.
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey || !storage) return;
    progress = loadProgress(storage);
    render();
  });

  const filtersPanel = root.querySelector<HTMLElement>('[data-filters]');
  if (filtersPanel) filtersPanel.hidden = false;
  render();
  openSectionOf(nextRow(rows, isWatched));

  function sections(): HTMLDetailsElement[] {
    return [...(root?.querySelectorAll<HTMLDetailsElement>('[data-section]') ?? [])];
  }

  function openSectionOf(row: Row | null): void {
    const item = row && items[rows.indexOf(row)];
    const section = (item ?? items[0])?.closest('details');
    if (section) section.open = true;
  }
}

/**
 * Returns `localStorage`, or null when the browser refuses it (some private modes, blocked
 * site data), so the page still works for the current visit.
 */
function browserStorage(): ProgressStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Replaces an element's text when the element exists.
 *
 * @param element - Target element.
 * @param text - New text.
 */
function setText(element: Element | null, text: string): void {
  if (element) element.textContent = text;
}
