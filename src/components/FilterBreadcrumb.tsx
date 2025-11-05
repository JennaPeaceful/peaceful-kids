import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatCategoryName } from '@/lib/utils';

// Import age group icons
import ages35Icon from '@/assets/age-icons/ages-3-5.png';
import ages38Icon from '@/assets/age-icons/ages-3-8.png';
import ages68Icon from '@/assets/age-icons/ages-6-8.png';
import ages912Icon from '@/assets/age-icons/ages-9-12.png';
import ages917Icon from '@/assets/age-icons/ages-9-17.png';
import ages1317Icon from '@/assets/age-icons/ages-13-17.png';
import allAgesIcon from '@/assets/age-icons/all-ages.png';
import emotionsIcon from '@/assets/emotions.svg';
import categoryBackground from '@/assets/category-icon-background.svg';

interface FilterBreadcrumbProps {
  selectedCategory: string | null;
  selectedCourses?: string[];
  selectedAgeGroup: string | null;
  selectedThemes: string[];
  courses?: string[];
  courseThumbnails?: { [key: string]: string };
  ageGroups: string[];
  themes: Array<{ id: string; name: string; icon: string; category: string[]; icon_svg_url?: string }>;
  onCategorySelect: (category: string | null) => void;
  onCourseToggle?: (course: string) => void;
  onAgeGroupSelect: (ageGroup: string | null) => void;
  onThemeToggle: (theme: string) => void;
}

const FilterBreadcrumb = ({
  selectedCategory,
  selectedCourses = [],
  selectedAgeGroup,
  selectedThemes,
  courses = [],
  courseThumbnails = {},
  ageGroups,
  themes,
  onCategorySelect,
  onCourseToggle,
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

  const getAgeGroupIcon = (ageGroup: string) => {
    const iconMap: { [key: string]: string } = {
      'Ages 3-5': ages35Icon,
      'Ages 3-8': ages38Icon,
      'Ages 6-8': ages68Icon,
      'Ages 9-12': ages912Icon,
      'Ages 9-17': ages917Icon,
      'Ages 13-17': ages1317Icon,
      'All Ages': allAgesIcon
    };
    return iconMap[ageGroup];
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

      {/* Age Group Pill */}
      {selectedAgeGroup && (
        <Badge 
          variant="secondary" 
          className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => toggleExpand('age-group')}
        >
          <span className="text-sm font-medium">
            {expandedPills.has('age-group') ? selectedAgeGroup : truncateText(selectedAgeGroup, 10)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onAgeGroupSelect(null);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      )}

      {/* Course Pills */}
      {selectedCourses.map((course) => {
        const pillId = `course-${course}`;
        const thumbnail = courseThumbnails[course];
        const iconUrl = thumbnail && typeof thumbnail === 'string' && thumbnail.trim() !== '' ? thumbnail : emotionsIcon;
        const showBg = /NO.?COLOR/i.test(iconUrl) || /\.svg(\?|$)/i.test(iconUrl) || /(\/logo\.svg|assets\/logo)/i.test(iconUrl);
        return (
          <Badge 
            key={course}
            variant="secondary" 
            className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
            onClick={() => toggleExpand(pillId)}
          >
            <div className="relative w-6 h-6 rounded-xl overflow-hidden">
              {showBg && (
                <img 
                  src={categoryBackground}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              )}
              <img 
                src={iconUrl}
                alt={course}
                className="absolute inset-0 w-full h-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.src = emotionsIcon;
                }}
              />
            </div>
            <span className="text-sm">
              {expandedPills.has(pillId) ? course : truncateText(course, 12)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onCourseToggle?.(course);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        );
      })}

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
                className="w-4 h-4 flex-shrink-0 object-contain"
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