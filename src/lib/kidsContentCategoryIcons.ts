// Kids content category icons - colored SVGs based on age group
// Binaurals
import binauralsRed from '@/assets/content-categories/kids/binaurals/red.svg';
import binauralsYellow from '@/assets/content-categories/kids/binaurals/yellow.svg';
import binauralsGreen from '@/assets/content-categories/kids/binaurals/green.svg';
import binauralsDarkblue from '@/assets/content-categories/kids/binaurals/darkblue.svg';
import binauralsBlue from '@/assets/content-categories/kids/binaurals/blue.svg';
import binauralsPurple from '@/assets/content-categories/kids/binaurals/purple.svg';
import binauralsOrange from '@/assets/content-categories/kids/binaurals/orange.svg';

// Breathwork
import breathworkRed from '@/assets/content-categories/kids/breathwork/red.svg';
import breathworkYellow from '@/assets/content-categories/kids/breathwork/yellow.svg';
import breathworkGreen from '@/assets/content-categories/kids/breathwork/green.svg';
import breathworkDarkblue from '@/assets/content-categories/kids/breathwork/darkblue.svg';
import breathworkBlue from '@/assets/content-categories/kids/breathwork/blue.svg';
import breathworkPurple from '@/assets/content-categories/kids/breathwork/purple.svg';
import breathworkOrange from '@/assets/content-categories/kids/breathwork/orange.svg';

// Meditation
import meditationRed from '@/assets/content-categories/kids/meditation/red.svg';
import meditationYellow from '@/assets/content-categories/kids/meditation/yellow.svg';
import meditationGreen from '@/assets/content-categories/kids/meditation/green.svg';
import meditationDarkblue from '@/assets/content-categories/kids/meditation/darkblue.svg';
import meditationBlue from '@/assets/content-categories/kids/meditation/blue.svg';
import meditationPurple from '@/assets/content-categories/kids/meditation/purple.svg';
import meditationOrange from '@/assets/content-categories/kids/meditation/orange.svg';

// Mindfulness Activities
import mindfulnessRed from '@/assets/content-categories/kids/mindfulnessactivities/red.svg';
import mindfulnessYellow from '@/assets/content-categories/kids/mindfulnessactivities/yellow.svg';
import mindfulnessGreen from '@/assets/content-categories/kids/mindfulnessactivities/green.svg';
import mindfulnessDarkblue from '@/assets/content-categories/kids/mindfulnessactivities/darkblue.svg';
import mindfulnessBlue from '@/assets/content-categories/kids/mindfulnessactivities/blue.svg';
import mindfulnessPurple from '@/assets/content-categories/kids/mindfulnessactivities/purple.svg';
import mindfulnessOrange from '@/assets/content-categories/kids/mindfulnessactivities/orange.svg';

// Somatic Resets
import somaticRed from '@/assets/content-categories/kids/somaticresets/red.svg';
import somaticYellow from '@/assets/content-categories/kids/somaticresets/yellow.svg';
import somaticGreen from '@/assets/content-categories/kids/somaticresets/green.svg';
import somaticDarkblue from '@/assets/content-categories/kids/somaticresets/darkblue.svg';
import somaticBlue from '@/assets/content-categories/kids/somaticresets/blue.svg';
import somaticPurple from '@/assets/content-categories/kids/somaticresets/purple.svg';
import somaticOrange from '@/assets/content-categories/kids/somaticresets/orange.svg';

// Transitions
import transitionsRed from '@/assets/content-categories/kids/transitions/red.svg';
import transitionsYellow from '@/assets/content-categories/kids/transitions/yellow.svg';
import transitionsGreen from '@/assets/content-categories/kids/transitions/green.svg';
import transitionsDarkblue from '@/assets/content-categories/kids/transitions/darkblue.svg';
import transitionsBlue from '@/assets/content-categories/kids/transitions/blue.svg';
import transitionsPurple from '@/assets/content-categories/kids/transitions/purple.svg';
import transitionsOrange from '@/assets/content-categories/kids/transitions/orange.svg';

// Age group to color mapping
const ageGroupToColor: Record<string, string> = {
  'Ages 3-5': 'red',
  'Ages 3-8': 'yellow',
  'Ages 6-8': 'green',
  'Ages 9-12': 'darkblue',
  'Ages 9-17': 'blue',
  'Ages 13-17': 'purple',
  'All Ages': 'orange',
};

// Category name normalization (handles variations in category names)
const normalizeCategoryName = (category: string): string => {
  const normalized = category.toLowerCase().replace(/\s+/g, '');

  // Handle variations
  if (normalized.includes('binaural')) return 'binaurals';
  if (normalized.includes('breathwork')) return 'breathwork';
  if (normalized.includes('meditation')) return 'meditation';
  if (normalized.includes('mindfulness')) return 'mindfulnessactivities';
  if (normalized.includes('somatic')) return 'somaticresets';
  if (normalized.includes('transition')) return 'transitions';

  return normalized;
};

// Icon lookup table
type ColoredIcons = Record<string, string>;
type CategoryIcons = Record<string, ColoredIcons>;

const kidsIcons: CategoryIcons = {
  binaurals: {
    red: binauralsRed,
    yellow: binauralsYellow,
    green: binauralsGreen,
    darkblue: binauralsDarkblue,
    blue: binauralsBlue,
    purple: binauralsPurple,
    orange: binauralsOrange,
  },
  breathwork: {
    red: breathworkRed,
    yellow: breathworkYellow,
    green: breathworkGreen,
    darkblue: breathworkDarkblue,
    blue: breathworkBlue,
    purple: breathworkPurple,
    orange: breathworkOrange,
  },
  meditation: {
    red: meditationRed,
    yellow: meditationYellow,
    green: meditationGreen,
    darkblue: meditationDarkblue,
    blue: meditationBlue,
    purple: meditationPurple,
    orange: meditationOrange,
  },
  mindfulnessactivities: {
    red: mindfulnessRed,
    yellow: mindfulnessYellow,
    green: mindfulnessGreen,
    darkblue: mindfulnessDarkblue,
    blue: mindfulnessBlue,
    purple: mindfulnessPurple,
    orange: mindfulnessOrange,
  },
  somaticresets: {
    red: somaticRed,
    yellow: somaticYellow,
    green: somaticGreen,
    darkblue: somaticDarkblue,
    blue: somaticBlue,
    purple: somaticPurple,
    orange: somaticOrange,
  },
  transitions: {
    red: transitionsRed,
    yellow: transitionsYellow,
    green: transitionsGreen,
    darkblue: transitionsDarkblue,
    blue: transitionsBlue,
    purple: transitionsPurple,
    orange: transitionsOrange,
  },
};

/**
 * Get the colored icon for a kids meditation based on category and age group
 * @param category - The content category (e.g., "Meditation", "Breathwork")
 * @param ageGroup - The age group (e.g., "Ages 3-5", "All Ages")
 * @returns The icon path or null if not found
 */
export function getKidsContentCategoryIcon(
  category: string,
  ageGroup: string | null
): string | null {
  const normalizedCategory = normalizeCategoryName(category);
  const color = ageGroupToColor[ageGroup || 'All Ages'] || 'orange';

  const categoryIcons = kidsIcons[normalizedCategory];
  if (!categoryIcons) return null;

  return categoryIcons[color] || categoryIcons.orange;
}

/**
 * Check if a category has kids colored icons available
 */
export function hasKidsIcon(category: string): boolean {
  const normalizedCategory = normalizeCategoryName(category);
  return normalizedCategory in kidsIcons;
}

/**
 * Get the color associated with an age group
 */
export function getAgeGroupColorName(ageGroup: string | null): string {
  return ageGroupToColor[ageGroup || 'All Ages'] || 'orange';
}
