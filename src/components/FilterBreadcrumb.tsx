import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatCategoryName } from '@/lib/utils';

interface FilterBreadcrumbProps {
  selectedCategory: string | null;
  selectedContentCategories: string[];
  selectedAgeGroup: string | null;
  selectedThemes: string[];
  contentCategories: string[];
  ageGroups: string[];
  themes: Array<{ id: string; name: string; icon: string; category: string[]; icon_svg_url?: string }>;
  onCategorySelect: (category: string | null) => void;
  onContentCategoryToggle: (category: string) => void;
  onAgeGroupSelect: (ageGroup: string | null) => void;
  onThemeToggle: (theme: string) => void;
}

const FilterBreadcrumb = ({
  selectedCategory,
  selectedContentCategories,
  selectedAgeGroup,
  selectedThemes,
  contentCategories,
  ageGroups,
  themes,
  onCategorySelect,
  onContentCategoryToggle,
  onAgeGroupSelect,
  onThemeToggle
}: FilterBreadcrumbProps) => {
  const [expandedPills, setExpandedPills] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedPills);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPills(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 15) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getAgeGroupColor = (ageGroup: string) => {
    const colorMap: { [key: string]: string } = {
      'Ages 3-5': '#bc1823',
      'Ages 3-8': '#ffff00', 
      'Ages 6-8': '#25632d',
      'Ages 9-12': '#274472',
      'Ages 9-17': '#bfe5ef',
      'Ages 13-17': '#800080',
      'All Ages': '#ffa629'
    };
    return colorMap[ageGroup] || '#6b7280';
  };

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {/* Category Pill */}
      {selectedCategory && (
        <Badge 
          variant="secondary" 
          className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => toggleExpand('category')}
        >
          <span className="text-sm font-medium">
            {expandedPills.has('category') ? formatCategoryName(selectedCategory) : truncateText(formatCategoryName(selectedCategory), 10)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onCategorySelect(null);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      )}

      {/* Content Category Pills */}
      {selectedContentCategories.map((category) => {
        const pillId = `content-${category}`;
        return (
          <Badge 
            key={category}
            variant="secondary" 
            className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => toggleExpand(pillId)}
          >
            <span className="text-sm">
              {expandedPills.has(pillId) ? category : truncateText(category, 12)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onContentCategoryToggle(category);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        );
      })}

      {/* Age Group Pill */}
      {selectedAgeGroup && (
        <Badge 
          variant="secondary" 
          className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
          onClick={() => toggleExpand('age-group')}
        >
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: getAgeGroupColor(selectedAgeGroup) }}
          />
          <span className="text-sm">
            {expandedPills.has('age-group') ? selectedAgeGroup : truncateText(selectedAgeGroup, 10)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onAgeGroupSelect(null);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      )}

      {/* Theme Pills */}
      {selectedThemes.map((themeName) => {
        const theme = themes.find(t => t.name === themeName);
        const pillId = `theme-${themeName}`;
        return (
          <Badge 
            key={themeName}
            variant="secondary" 
            className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
            onClick={() => toggleExpand(pillId)}
          >
            {theme?.icon_svg_url && (
              <img 
                src={theme.icon_svg_url} 
                alt={themeName}
                className="w-4 h-4 flex-shrink-0"
              />
            )}
            <span className="text-sm">
              {expandedPills.has(pillId) ? themeName : truncateText(themeName, 10)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onThemeToggle(themeName);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
};

export default FilterBreadcrumb;