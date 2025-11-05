// Age group color utility functions
export const getAgeGroupColor = (ageGroup: string | null): string | null => {
  if (!ageGroup) return null;
  
  const colorMap: { [key: string]: string } = {
    'Ages 3-5': 'hsl(var(--age-3-5))',
    'Ages 3-8': 'hsl(var(--age-3-8))',
    'Ages 6-8': 'hsl(var(--age-6-8))',
    'Ages 9-12': 'hsl(var(--age-9-12))',
    'Ages 9-17': 'hsl(var(--age-9-17))',
    'Ages 13-17': 'hsl(var(--age-13-17))',
    'All Ages': 'hsl(var(--age-all))'
  };
  
  return colorMap[ageGroup] || null;
};

// Get age group class for Tailwind
export const getAgeGroupColorClass = (ageGroup: string | null): string => {
  if (!ageGroup) return '';
  
  const classMap: { [key: string]: string } = {
    'Ages 3-5': '[&_path]:fill-[hsl(var(--age-3-5))]',
    'Ages 3-8': '[&_path]:fill-[hsl(var(--age-3-8))]',
    'Ages 6-8': '[&_path]:fill-[hsl(var(--age-6-8))]',
    'Ages 9-12': '[&_path]:fill-[hsl(var(--age-9-12))]',
    'Ages 9-17': '[&_path]:fill-[hsl(var(--age-9-17))]',
    'Ages 13-17': '[&_path]:fill-[hsl(var(--age-13-17))]',
    'All Ages': '[&_path]:fill-[hsl(var(--age-all))]'
  };
  
  return classMap[ageGroup] || '';
};
