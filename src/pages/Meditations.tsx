import { useState, useEffect } from 'react';
import { Search, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import MeditationCard from '../components/MeditationCard';
import FilterBreadcrumb from '../components/FilterBreadcrumb';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

type SortOption = 'title' | 'duration' | 'created_at';

const ITEMS_PER_LOAD = 15;

const Meditations = () => {
  const { 
    filteredMeditations, 
    filters, 
    categories,
    contentCategories, 
    themes, 
    ageGroups, 
    setFilters, 
    clearFilters, 
    fetchMeditations, 
    isLoading 
  } = useMeditationStore();
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_LOAD);
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  useEffect(() => {
    setDisplayedItems(ITEMS_PER_LOAD);
  }, [filteredMeditations]);

  const handleCategorySelect = (category: string | null) => {
    if (category === null) {
      clearFilters();
    } else {
      setFilters({ selectedCategory: category });
    }
  };

  const handleContentCategoryToggle = (category: string) => {
    const newCategories = filters.selectedContentCategories.includes(category)
      ? filters.selectedContentCategories.filter(c => c !== category)
      : [...filters.selectedContentCategories, category];
    setFilters({ selectedContentCategories: newCategories });
  };

  const handleAgeGroupSelect = (ageGroup: string | null) => {
    setFilters({ selectedAgeGroup: ageGroup });
  };

  const handleThemeToggle = (theme: string) => {
    const newThemes = filters.selectedThemes.includes(theme)
      ? filters.selectedThemes.filter(t => t !== theme)
      : [...filters.selectedThemes, theme];
    setFilters({ selectedThemes: newThemes });
  };

  const handleSearchChange = (query: string) => {
    setFilters({ searchQuery: query });
  };

  const handleClearAll = () => {
    clearFilters();
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when user scrolls to bottom
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (displayedItems < sortedMeditations.length) {
        setDisplayedItems(prev => Math.min(prev + ITEMS_PER_LOAD, sortedMeditations.length));
      }
    }
  };

  const hasActiveFilters = filters.selectedCategory || filters.selectedContentCategories.length > 0 || filters.selectedAgeGroup || filters.selectedThemes.length > 0 || filters.searchQuery;
  
  // Age group color mapping
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
  
  // Get filtered themes that don't overlap with content categories
  const availableThemes = themes.filter(theme => 
    !filters.selectedCategory || theme.category.includes(filters.selectedCategory) &&
    !filters.selectedContentCategories.includes(theme.name)
  );

  // Get content categories for the selected category
  const availableContentCategories = filters.selectedCategory 
    ? contentCategories.filter(category => {
        // For adults, show all content categories
        if (filters.selectedCategory === 'Adult') return true;
        // For kids, show content categories that have meditations
        return filteredMeditations.some(m => m.content_categories?.includes(category));
      })
    : contentCategories;

  // Sort meditations
  const sortedMeditations = [...filteredMeditations].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'duration') {
      aValue = a.duration || 0;
      bValue = b.duration || 0;
    } else if (sortBy === 'created_at') {
      aValue = new Date(a.created_at || '').getTime();
      bValue = new Date(b.created_at || '').getTime();
    } else {
      aValue = (a.title || '').toLowerCase();
      bValue = (b.title || '').toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const displayedMeditations = sortedMeditations.slice(0, displayedItems);

  return (
    <div className="pb-24 pt-6 min-h-screen">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gradient-primary">
            Meditations
          </h1>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="text-destructive"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search meditations..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-card border-border rounded-xl"
          />
        </div>

        {/* Filter Breadcrumb */}
        <FilterBreadcrumb
          selectedCategory={filters.selectedCategory}
          selectedContentCategories={filters.selectedContentCategories}
          selectedAgeGroup={filters.selectedAgeGroup}
          selectedThemes={filters.selectedThemes}
          contentCategories={availableContentCategories}
          ageGroups={ageGroups}
          themes={availableThemes}
          onCategorySelect={handleCategorySelect}
          onContentCategoryToggle={handleContentCategoryToggle}
          onAgeGroupSelect={handleAgeGroupSelect}
          onThemeToggle={handleThemeToggle}
        />

        {/* Filter Selection - Show all available filters */}
        {!filters.selectedCategory && categories.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => handleCategorySelect(category.name)}
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                >
                  {category.thumbnail_svg_url && (
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent p-2">
                      <img 
                        src={category.thumbnail_svg_url} 
                        alt={category.display_name}
                        className="w-full h-full object-contain filter brightness-0 invert"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">{category.display_name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Content Categories */}
        {filters.selectedCategory && availableContentCategories.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Content Categories
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.selectedContentCategories.length > 0 
                    ? `${filters.selectedContentCategories.length} selected`
                    : 'Select content categories'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                {availableContentCategories.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => handleContentCategoryToggle(category)}
                    className={filters.selectedContentCategories.includes(category) ? 'bg-accent' : ''}
                  >
                    {category}
                    {filters.selectedContentCategories.includes(category) && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Age Groups - show for Kid category */}
        {filters.selectedCategory === 'Kid' && ageGroups.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Age Group
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.selectedAgeGroup || 'Select age group'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {ageGroups.filter(ag => ag).map((ageGroup) => (
                  <DropdownMenuItem 
                    key={ageGroup}
                    onClick={() => handleAgeGroupSelect(ageGroup)}
                    className={`${filters.selectedAgeGroup === ageGroup ? 'bg-accent' : ''} flex items-center`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getAgeGroupColor(ageGroup) }}
                    />
                    {ageGroup}
                  </DropdownMenuItem>
                ))}
                {filters.selectedAgeGroup && (
                  <DropdownMenuItem 
                    onClick={() => handleAgeGroupSelect(null)} 
                    className="text-destructive"
                  >
                    Clear selection
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Themes */}
        {filters.selectedCategory && availableThemes.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Themes
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.selectedThemes.length > 0 
                    ? `${filters.selectedThemes.length} selected`
                    : 'Select themes'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                {availableThemes.map((theme) => (
                  <DropdownMenuItem 
                    key={theme.id}
                    onClick={() => handleThemeToggle(theme.name)}
                    className={`${filters.selectedThemes.includes(theme.name) ? 'bg-accent' : ''} flex items-center`}
                  >
                    {theme.icon_svg_url && (
                      <img 
                        src={theme.icon_svg_url} 
                        alt={theme.name}
                        className="w-4 h-4 mr-2"
                      />
                    )}
                    {theme.name}
                    {filters.selectedThemes.includes(theme.name) && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4">
        {filteredMeditations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No meditations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredMeditations.length} meditation{filteredMeditations.length !== 1 ? 's' : ''} found
              </p>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: SortOption) => handleSort(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="created_at">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Results Grid */}
            <ScrollArea className="h-[60vh]" onScrollCapture={handleScroll}>
              <div className="grid grid-cols-2 gap-4 pb-6">
                {displayedMeditations.map((meditation) => (
                  <MeditationCard key={meditation.id} meditation={meditation} />
                ))}
              </div>
              
              {displayedItems < sortedMeditations.length && (
                <div className="text-center py-4 text-muted-foreground">
                  Loading more...
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default Meditations;