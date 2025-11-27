// Content category color mapping for icon backgrounds
export const contentCategoryColors: Record<string, string> = {
  'Meditation': '#49a669',
  'Getting Started': '#49a669',
  'Somatic Reset': '#f3839c',
  'Binaurals': '#449dbd',
  'Meditation with Breathwork': '#f79345',
  'Breathwork': '#f79345',
  'Chakra Meditations': '#d1cb3f',
  'Guided Meditations with Background Music': '#839ab6',
  'Guided Meditations without Background Music': '#b7d885',
  'Specific Intention Meditations': '#da3062',
  'Meditation with Sound Healing': '#8cd5e4',
  'Transitions': '#f8a383',
  'Repeated Mantra Meditations': '#ffda83',
  'Body Scan Meditations': '#c7a7cf',
  'Mindfulness Activities': '#77c480',
};

export function getContentCategoryColor(categoryName: string): string | null {
  return contentCategoryColors[categoryName] || null;
}
