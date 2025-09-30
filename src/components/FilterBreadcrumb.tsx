import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

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
  const availableContentCategories = selectedCategory 
    ? contentCategories.filter(category => {
        if (selectedCategory === 'Adult') return true;
        return true; // Show all for now, can be filtered based on actual data
      })
    : [];

  const availableThemes = themes.filter(theme => 
    !selectedCategory || theme.category.includes(selectedCategory)
  );

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {/* Only show breadcrumb if category is selected */}
      {selectedCategory && (
        <>
          {/* Category */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-3 text-sm">
                {selectedCategory}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onCategorySelect('Kid')}>
                Kids
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCategorySelect('Adult')}>
                Adults
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCategorySelect(null)} className="text-destructive">
                Clear
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          
          {/* Content Categories */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-3 text-sm">
                {selectedContentCategories.length > 0 
                  ? selectedContentCategories.length === 1 
                    ? selectedContentCategories[0]
                    : `${selectedContentCategories.length} selected`
                  : 'Content Category'
                }
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-60 overflow-y-auto">
              {availableContentCategories.map((category) => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => onContentCategoryToggle(category)}
                  className={selectedContentCategories.includes(category) ? 'bg-accent' : ''}
                >
                  {category}
                  {selectedContentCategories.includes(category) && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {selectedCategory === 'Kid' && (
        <>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          
          {/* Age Groups */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-3 text-sm">
                {selectedAgeGroup || 'Age Group'}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ageGroups.filter(ag => ag).map((ageGroup) => (
                <DropdownMenuItem 
                  key={ageGroup}
                  onClick={() => onAgeGroupSelect(selectedAgeGroup === ageGroup ? null : ageGroup)}
                  className={selectedAgeGroup === ageGroup ? 'bg-accent' : ''}
                >
                  {ageGroup}
                </DropdownMenuItem>
              ))}
              {selectedAgeGroup && (
                <DropdownMenuItem onClick={() => onAgeGroupSelect(null)} className="text-destructive">
                  Clear
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {selectedCategory && (
        <>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          
          {/* Themes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-3 text-sm">
                {selectedThemes.length > 0 
                  ? selectedThemes.length === 1 
                    ? selectedThemes[0]
                    : `${selectedThemes.length} themes`
                  : 'Themes'
                }
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-60 overflow-y-auto">
              {availableThemes.map((theme) => (
                <DropdownMenuItem 
                  key={theme.id}
                  onClick={() => onThemeToggle(theme.name)}
                  className={`${selectedThemes.includes(theme.name) ? 'bg-accent' : ''} flex items-center`}
                >
                  {theme.icon_svg_url && (
                    <img 
                      src={theme.icon_svg_url} 
                      alt={theme.name}
                      className="w-4 h-4 mr-2"
                    />
                  )}
                  {theme.name}
                  {selectedThemes.includes(theme.name) && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

export default FilterBreadcrumb;