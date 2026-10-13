/**
 * Everything personal lives here: change this file, not the components.
 */
export const site = {
  name: 'Fikayo Olowu',
  handle: 'Forgz',
  company: 'Emberz Technology',
  /** The two handwritten words of the intro. Both must exist in data/handwriting.json. */
  hello: ['Hello', 'Forgz here'] as const,
  /** Portrait shown in the intro (file in public/assets). Empty string shows an upload button instead. */
  photo: 'forgz.jpg',
  /**
   * Call-to-action at the end. Set href to a mailto:, WhatsApp (https://wa.me/234...) or any URL.
   * While href is empty the button shows a small "coming soon" note.
   */
  contact: { label: 'Start a project', href: '' },
  meet: {
    eyebrow: "Hi, I'm Fikayo Olowu.",
    title: 'I lead engineering at Emberz Technology.',
    body: 'I build products that look as good as they run, for businesses that want to be taken seriously online.',
    /** Floating chips around the portrait; `speed` is the parallax factor. */
    chips: [
      { text: 'Lead engineer', pos: { left: '-9%', top: '12%' }, speed: 0.05 },
      { text: 'Akure, Nigeria', pos: { right: '-9%', top: '44%' }, speed: -0.035 },
      { text: 'React · TypeScript · .NET', pos: { left: '4%', bottom: '-2%' }, speed: 0.025 },
    ],
  },
  hook: {
  lead: 'First impressions matter, but performance keeps people around. We engineer high-impact digital experiences for growing brands.',
  ringLabel: 'Engineered for Impact',
},
  make: {
    eyebrow: 'At Emberz Technology, we make',
  },
  process: {
    title: 'How we take you from idea to launch.',
    steps: [
      { n: '01', title: 'Listen', body: 'We start with your customers and your goals, not a colour palette.' },
      { n: '02', title: 'Design', body: 'Real screens in front of you early, long before any production code.' },
      { n: '03', title: 'Build and ship', body: 'React and .NET, built to work on every device you just saw, then launched.' },
    ],
  },
  close: {
    title: "Let's build yours.",
    body: "Tell me what you're selling. I'll show you what it could look like.",
    backLabel: 'Back to the start',
  },
} as const;
