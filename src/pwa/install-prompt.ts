import { installDismissedKey } from './constants.ts';
import type { BeforeInstallPromptEvent } from './types.ts';

/**
 * Tells whether the device runs iOS or iPadOS, where installing goes through Safari's Share
 * menu instead of an install button. iPadOS reports itself as a Mac with a touch screen.
 *
 * @param userAgent - The browser's user agent.
 * @param platform - `navigator.platform`.
 * @param maxTouchPoints - `navigator.maxTouchPoints`.
 * @returns Whether to show the Safari steps.
 */
export function isAppleMobile(
  userAgent: string,
  platform: string,
  maxTouchPoints: number,
): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

/**
 * Shows the install invitation when the site is not installed yet and the visitor has not
 * turned it down: an install button where the browser offers one, Safari's steps on iOS.
 */
export function startInstallPrompt(): void {
  const card = document.querySelector<HTMLElement>('[data-install]');
  if (!card || isInstalled() || readDismissed()) return;
  const button = card.querySelector<HTMLButtonElement>('[data-install-button]');
  const iosSteps = card.querySelector<HTMLElement>('[data-install-ios]');
  let deferred: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    // The browser offers its own install: the Safari steps no longer apply.
    if (iosSteps) iosSteps.hidden = true;
    if (button) button.hidden = false;
    card.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    card.hidden = true;
  });

  if (isAppleMobile(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)) {
    if (iosSteps) iosSteps.hidden = false;
    card.hidden = false;
  }

  button?.addEventListener('click', () => {
    if (!deferred) return;
    void deferred.prompt();
    void deferred.userChoice.then(() => {
      card.hidden = true;
    });
  });
  card.querySelector('[data-install-dismiss]')?.addEventListener('click', () => {
    card.hidden = true;
    rememberDismissed();
  });
}

/** Whether the site already runs as an installed app. */
function isInstalled(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || window.matchMedia('(display-mode: standalone)').matches;
}

/** Whether the visitor turned the invitation down before; false when storage is unavailable. */
function readDismissed(): boolean {
  try {
    return localStorage.getItem(installDismissedKey) === 'true';
  } catch {
    return false;
  }
}

/** Remembers the refusal; without storage, the invitation stays hidden for this visit only. */
function rememberDismissed(): void {
  try {
    localStorage.setItem(installDismissedKey, 'true');
  } catch {
    // Nothing to keep the choice in.
  }
}
