import projects from './projects.json';
import showcase from './showcase.json';
import type { WorkItem } from './workItems';

/** Your projects (laptop + scrolling screenshot). Edit projects.json, or serve the same shape from an API. */
export const staticProjects = projects as WorkItem[];
/** The "every screen" device row. */
export const showcaseDevices = showcase as WorkItem[];

export const buildWorkItems = (projectList: WorkItem[]): WorkItem[] => [...projectList, ...showcaseDevices];
