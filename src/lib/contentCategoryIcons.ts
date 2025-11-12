import binauralBeats from '@/assets/content-categories/binaural-beats.svg';
import bodyScan from '@/assets/content-categories/body-scan.svg';
import chakra from '@/assets/content-categories/chakra.svg';
import guidedWithMusic from '@/assets/content-categories/guided-with-music.svg';
import guidedWithoutMusic from '@/assets/content-categories/guided-without-music.svg';
import breathwork from '@/assets/content-categories/breathwork.svg';
import soundHealing from '@/assets/content-categories/sound-healing.svg';
import specificIntention from '@/assets/content-categories/specific-intention.svg';

export const contentCategoryIcons: Record<string, string> = {
  'Binaurals': binauralBeats,
  'Body Scan Meditations': bodyScan,
  'Chakra Meditations': chakra,
  'Guided Meditations with Background Music': guidedWithMusic,
  'Guided Meditations without Background Music': guidedWithoutMusic,
  'Meditation with Breathwork': breathwork,
  'Breathwork': breathwork,
  'Meditation with Sound Healing': soundHealing,
  'Specific Intention Meditations': specificIntention,
};

export function getContentCategoryIcon(categoryName: string): string | null {
  return contentCategoryIcons[categoryName] || null;
}
