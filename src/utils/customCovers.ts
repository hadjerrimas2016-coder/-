// Persistence for user-selected custom story cover images

const STORAGE_KEY = 'raed_custom_story_covers';

export interface CustomCoverMap {
  [storyId: string]: string;
}

export function getAllCustomCovers(): CustomCoverMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Error reading custom story covers:', e);
    return {};
  }
}

export function getStoryCover(storyId: string, defaultCover: string): string {
  const all = getAllCustomCovers();
  return all[storyId] || defaultCover;
}

export function saveStoryCover(storyId: string, coverUrl: string): void {
  if (typeof window === 'undefined' || !storyId || !coverUrl) return;
  try {
    const all = getAllCustomCovers();
    all[storyId] = coverUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('raed_story_cover_updated', { detail: { storyId, coverUrl } }));
  } catch (e) {
    console.warn('Error saving custom story cover:', e);
  }
}

export function resetStoryCover(storyId: string): void {
  if (typeof window === 'undefined' || !storyId) return;
  try {
    const all = getAllCustomCovers();
    delete all[storyId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('raed_story_cover_updated', { detail: { storyId, coverUrl: null } }));
  } catch (e) {
    console.warn('Error resetting custom story cover:', e);
  }
}
