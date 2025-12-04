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
import { APP_URLS } from '@/config/urls';

interface FilterBreadcrumbProps {
  selectedCategory: string | null;
  selectedCourses?: string[];
  selectedModule?: number | null;
  selectedAgeGroup: string | null;
  selectedThemes: string[];
  selectedContentCategories?: string[];
  courses?: string[];
  courseThumbnails?: { [key: string]: string };
  ageGroups: string[];
  themes: Array<{ id: string; name: string; icon: string; category: string[]; icon_svg_url?: string }>;
  contentCategories?: Array<{ id: string; name: string; sort_order?: number }>;
  onCategorySelect: (category: string | null) => void;
  onCourseToggle?: (course: string) => void;
  onModuleSelect?: (module: number | null) => void;
  onAgeGroupSelect: (ageGroup: string | null) => void;
  onThemeToggle: (theme: string) => void;
  onContentCategoryToggle?: (contentCategory: string) => void;
}

const FilterBreadcrumb = ({
  selectedCategory,
  selectedCourses = [],
  selectedModule = null,
  selectedAgeGroup,
  selectedThemes,
  selectedContentCategories = [],
  courses = [],
  courseThumbnails = {},
  ageGroups,
  themes,
  contentCategories = [],
  onCategorySelect,
  onCourseToggle,
  onModuleSelect,
  onAgeGroupSelect,
  onThemeToggle,
  onContentCategoryToggle
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
    <div className="flex items-center gap-2 flex-wrap">
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
        // Removed small icon from course pill per request
        return (
          <Badge 
            key={course}
            variant="secondary" 
            className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
            onClick={() => toggleExpand(pillId)}
          >
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

      {/* Module Pill */}
      {selectedModule !== null && (
        <Badge 
          variant="secondary" 
          className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <span className="text-sm">Module {selectedModule}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onModuleSelect?.(null);
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

        // Build CDN URL just like Meditations page to avoid broken SVGs
        let themeFileName = themeName.replace(/\\/g, '-').replace(/\//g, '-');
        if (themeName === 'Miscellaneous') {
          themeFileName = 'Misellaneous'; // CDN has misspelled version
        }
        const themeIconUrl = `${APP_URLS.cdnBase}/SVG%20FILES%20NO%20COLOR/CONTENT%20CATEGORY%20NO%20COLOR/${encodeURIComponent(themeFileName)}.svg`;

        return (
          <Badge 
            key={themeName}
            variant="secondary" 
            className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
            onClick={() => toggleExpand(pillId)}
          >
            <img 
              src={themeIconUrl}
              alt={themeName}
              className="w-4 h-4 flex-shrink-0 object-contain"
              onError={(e) => { e.currentTarget.src = emotionsIcon; }}
            />
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

      {/* Content Category Pills */}
      {selectedContentCategories.map((contentCategoryName) => {
        const pillId = `content-category-${contentCategoryName}`;
        return (
          <Badge 
            key={contentCategoryName}
            variant="secondary" 
            className="h-8 px-3 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
            onClick={() => toggleExpand(pillId)}
          >
            <span className="text-sm">
              {expandedPills.has(pillId) ? contentCategoryName : truncateText(contentCategoryName, 12)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onContentCategoryToggle?.(contentCategoryName);
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
