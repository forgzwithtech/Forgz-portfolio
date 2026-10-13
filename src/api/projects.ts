import type { WorkItem } from '../data/workItems';
import { staticProjects } from '../data';

/**
 * Where projects come from.
 *
 * - Default: the static list in data/projects.json (works with no backend).
 * - Set VITE_API_URL (for example https://api.emberz.tech) and the site will call
 *   GET {VITE_API_URL}/projects and use the JSON array it returns (same shape as
 *   data/projects.json). If the call fails it quietly falls back to the static list.
 */
export async function loadProjects(signal?: AbortSignal): Promise<WorkItem[]> {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (!base) return staticProjects;
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/projects`, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as WorkItem[];
    return Array.isArray(data) && data.length ? data : staticProjects;
  } catch {
    return staticProjects;
  }
}
