import { useState, useEffect } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import MeditationCard from '../components/MeditationCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

type SortOption = 'title' | 'duration' | 'created_at';

const ITEMS_PER_LOAD = 15;

const Meditations = () => {
  const { 
    filteredMeditations, 
    filters, 
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

  const categories = ['Kids', 'Adults'] as const;

  const handleCategorySelect = (category: 'Kids' | 'Adults') => {
    setFilters({ selectedCategory: category });
  };

  const handleContentCategoryToggle = (category: string) => {
    const newCategories = filters.selectedContentCategories.includes(category)
      ? filters.selectedContentCategories.filter(c => c !== category)
      : [...filters.selectedContentCategories, category];
    setFilters({ selectedContentCategories: newCategories });
  };

  const handleAgeGroupToggle = (ageGroup: string) => {
    setFilters({ selectedAgeGroup: filters.selectedAgeGroup === ageGroup ? null : ageGroup });
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
  
  // Get filtered themes that don't overlap with content categories
  const availableThemes = themes.filter(theme => 
    !filters.selectedCategory || theme.category.includes(filters.selectedCategory) &&
    !filters.selectedContentCategories.includes(theme.name)
  );

  // Get content categories for the selected category
  const availableContentCategories = filters.selectedCategory 
    ? contentCategories.filter(category => {
        // For adults, show all content categories
        if (filters.selectedCategory === 'Adults') return true;
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

        {/* Category Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filters.selectedCategory === category ? "default" : "outline"}
                onClick={() => handleCategorySelect(category)}
                className="flex-1"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {filters.selectedCategory && (
          <div className="space-y-6 mb-6">
            {/* Content Categories */}
            {availableContentCategories.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Content Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableContentCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={filters.selectedContentCategories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleContentCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Age Groups (Kids only) */}
            {filters.selectedCategory === 'Kids' && ageGroups.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Age Group
                </label>
                <div className="flex flex-wrap gap-2">
                  {ageGroups.filter(ag => ag).map((ageGroup) => (
                    <Badge
                      key={ageGroup}
                      variant={filters.selectedAgeGroup === ageGroup ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAgeGroupToggle(ageGroup)}
                    >
                      {ageGroup}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Themes */}
            {availableThemes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Themes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableThemes.map((theme) => (
                    <Badge
                      key={theme.id}
                      variant={filters.selectedThemes.includes(theme.name) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleThemeToggle(theme.name)}
                    >
                      <span className="mr-1">{theme.icon}</span>
                      {theme.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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