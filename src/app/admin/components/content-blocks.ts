export const CONTENT_BLOCKS = [
  { id: 'hero', label: 'Hero та подія' },
  { id: 'about', label: 'Про подію' },
  { id: 'organizers', label: 'Організаторки' },
  { id: 'speakers', label: 'Спікери' },
  { id: 'schedule', label: 'Програма' },
  { id: 'gallery', label: 'Галерея' },
  { id: 'faq', label: 'FAQ' },
  { id: 'tickets', label: 'Квитки та ціни' },
  { id: 'links', label: 'Посилання та SEO' },
] as const

export type ContentBlockId = (typeof CONTENT_BLOCKS)[number]['id']
