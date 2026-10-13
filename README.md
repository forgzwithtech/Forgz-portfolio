# Forgz × Emberz Technology: keynote-style portfolio

React 18 + TypeScript + Vite. A scroll-driven "Apple keynote" pitch: handwritten hello, portrait, the pitch,
what Emberz makes, your projects on laptops (zoom, pan, scroll inside the screen), every device
(phones, foldables, Googlebook) and a close.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview
```

Add `?debug` to the URL to expose `window.__forgz` (timeline, freeze, render) for testing.

## Where things live

| Folder | What it is |
| --- | --- |
| `src/config/site.ts` | All personal copy: name, hello words, photo, contact button, scene text. |
| `src/data/projects.json` | Your projects (laptop + scrolling screenshot). |
| `src/data/showcase.json` | The "every screen" device row. |
| `src/data/content.ts` | "What we make" words and background washes. |
| `src/data/deviceGeometry.json` | Screen corners and hinge data for each device photo. |
| `src/components/scenes/` | One component per scene. |
| `src/components/devices/` | `bodies/` (JSX), `rigs/` (how each device opens), `registry.ts`, `CellController.ts`. |
| `src/components/screens/` | What is shown on a screen (screenshot or the live demo). |
| `src/lib/` | Scroll engine, timeline storyboard, homography maths. |
| `src/styles/` | One CSS file per area. |
| `public/assets/` | Screenshots and device photos. |

## Smooth animation

Scrolling is native; `ScrollEngine` eases towards `scrollY` with time-based smoothing (same feel at 60/120/144 Hz)
and only runs while something is moving. Animations write to the DOM through refs with change detection, so React
never re-renders while you scroll. Off-screen device cells are hidden and skipped. Motion blur is quantised.

## Add a project

Add an object to `src/data/projects.json` and drop its screenshots into `public/assets/`:

```json
{
  "id": "my-project", "device": "mac", "wash": 0,
  "category": "The proof · Web", "title": "My Project",
  "blurb": "One line about it.", "url": "https://example.com",
  "page": { "src": "my_page.jpg", "w": 1600, "h": 4000 },
  "nav":  { "src": "my_nav.jpg",  "w": 1600, "h": 100 }
}
```

`page` is a full-height screenshot that scrolls inside the laptop. Optional: `nav` (sticky header image),
`pill` (floating bar that fades in), `modal` (pops up after the scroll). See the IK Phones entry for all of them.
`wash` (0-4) picks the background colour.

## Backend contract (.NET later)

Set `VITE_API_URL` and the site calls `GET {VITE_API_URL}/projects`, expecting a JSON array with the same shape as
`projects.json` (the `WorkItem` type in `src/data/workItems.ts`). Image `src` values are file names under
`public/assets/`. If the call fails, the site falls back to the static list. Enable CORS for your site origin.
A minimal ASP.NET endpoint:

```csharp
app.MapGet("/projects", async (Db db) => await db.Projects.OrderBy(p => p.Order).ToListAsync());
```

## Add a device

1. Put photos in `public/assets/` and add its geometry to `deviceGeometry.json`.
2. Add a `Body` (JSX) and a `Rig` (implements `DeviceRig`: `layout`, `setOpen`) and register them in `components/devices/registry.ts`.
3. Reference it from a `WorkItem` (`device` id, plus `kindOf` in the registry).

## Contact button

Set `site.contact.href` in `src/config/site.ts` (`mailto:`, `https://wa.me/234…`, any URL). Empty shows a "coming soon" note.

## Deploy

`npm run build`, then upload `dist/` to Vercel, Netlify, Cloudflare Pages or any static host. For a sub-path, set
`base` in `vite.config.ts`.

## Loader, performance and mobile behaviour

- **Loader:** "Hello" is the loader. It writes itself, then breathes until every image and font has loaded
  (`src/lib/preload.ts`, `src/lib/assets.ts`), then "Forgz here" appears and the site opens. Scrolling is locked
  until then. A file that fails is retried once, and after 15 s the site opens anyway. If you add a new image to a
  component, add it to `assetsFor()` so the loader waits for it.
- **Lite mode** (`src/lib/perf.ts`, `src/styles/lite.css`): chosen at start-up for devices with ≤4 GB RAM, ≤4 cores
  or data-saver, and switched on at runtime if scrolling drops frames. It removes blur, backdrop blur, floating
  animations, glare and motion blur. Force it with `?perf=lite` or `?perf=full`.
- **Phones** load smaller screenshots (`sm` in `projects.json`; `od_page_m.jpg` etc.), which saves a lot of memory.
- **Touch scrolling** snaps (CSS `scroll-snap`, proximity) to each chapter's resting position, but never inside the
  in-screen scroll of a project. The layout ignores the address bar resizing, and easing is tighter on touch.
