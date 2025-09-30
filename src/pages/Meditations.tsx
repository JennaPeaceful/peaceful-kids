import { useState, useEffect } from 'react';
import { Search, X, ChevronsUp, ChevronsDown, Heart } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import { useFavorites } from '../hooks/useFavorites';
import MeditationCard from '../components/MeditationCard';
import FilterBreadcrumb from '../components/FilterBreadcrumb';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { formatCategoryName } from '@/lib/utils';

type MediaType = 'all' | 'audio' | 'video';

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
  const { favorites } = useFavorites();
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_LOAD);
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  useEffect(() => {
    setDisplayedItems(ITEMS_PER_LOAD);
  }, [filteredMeditations]);

  useEffect(() => {
    if (resultsExpanded) {
      const handleWindowScroll = () => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        
        if (scrollHeight - scrollTop <= clientHeight + 100) {
          setDisplayedItems(prev => {
            const total = filteredMeditations.length;
            return prev < total ? Math.min(prev + ITEMS_PER_LOAD, total) : prev;
          });
        }
      };

      window.addEventListener('scroll', handleWindowScroll);
      return () => window.removeEventListener('scroll', handleWindowScroll);
    }
  }, [resultsExpanded, filteredMeditations.length]);

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
    setMediaType('all');
    setShowFavoritesOnly(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (resultsExpanded) {
      // For expanded view, handle window scroll
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        if (displayedItems < sortedMeditations.length) {
          setDisplayedItems(prev => Math.min(prev + ITEMS_PER_LOAD, sortedMeditations.length));
        }
      }
    } else {
      // For collapsed view, handle ScrollArea scroll
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        if (displayedItems < sortedMeditations.length) {
          setDisplayedItems(prev => Math.min(prev + ITEMS_PER_LOAD, sortedMeditations.length));
        }
      }
    }
  };

  const hasActiveFilters = filters.selectedCategory || filters.selectedContentCategories.length > 0 || filters.selectedAgeGroup || filters.selectedThemes.length > 0 || filters.searchQuery || showFavoritesOnly;
  
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
    (!filters.selectedCategory || theme.category?.includes(filters.selectedCategory)) &&
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

  // Sort meditations and filter by media type and favorites
  const filteredByMediaType = mediaType === 'all' 
    ? filteredMeditations 
    : filteredMeditations.filter(m => m.media_type === mediaType);

  const filteredByFavorites = showFavoritesOnly
    ? filteredByMediaType.filter(m => favorites.includes(m.id))
    : filteredByMediaType;

  const sortedMeditations = [...filteredByFavorites].sort((a, b) => {
    const aTitle = (a.title || '').toLowerCase();
    const bTitle = (b.title || '').toLowerCase();
    return aTitle > bTitle ? 1 : -1;
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search meditations..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-card border-border rounded-xl"
          />
        </div>

        {/* Favorites Filter Toggle */}
        <div className="mb-6">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="w-full"
          >
            <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
          </Button>
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

        {/* Age Groups - show for Kid category immediately after Kids is selected */}
        {filters.selectedCategory === 'Kid' && !filters.selectedAgeGroup && ageGroups.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Age Group
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ageGroups.filter(ag => ag).map((ageGroup) => {
                const isSelected = filters.selectedAgeGroup === ageGroup;
                const color = getAgeGroupColor(ageGroup);
                return (
                  <Button
                    key={ageGroup}
                    variant="outline"
                    onClick={() => handleAgeGroupSelect(isSelected ? null : ageGroup)}
                    className={`flex items-center justify-center h-auto py-6 transition-all ${
                      isSelected 
                        ? 'border-2 shadow-lg scale-105' 
                        : 'hover:shadow-primary hover:scale-102'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${color}dd, ${color})`,
                      borderColor: isSelected ? color : `${color}88`,
                      color: color === '#ffff00' ? '#000' : '#fff'
                    }}
                  >
                    <span className="font-semibold text-sm">{ageGroup}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Categories - For Kids after age group, for Adults immediately */}
        {filters.selectedCategory && 
         ((filters.selectedCategory === 'Kid' && filters.selectedAgeGroup && !filters.selectedContentCategories.length) ||
          (filters.selectedCategory === 'Adult' && !filters.selectedContentCategories.length)) &&
         availableContentCategories.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Content Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableContentCategories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => handleContentCategoryToggle(category)}
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                >
                  <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-secondary via-primary to-accent p-3 flex items-center justify-center">
                    <div className="text-white font-bold text-lg">
                      {category.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-center leading-tight px-2">{category}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Themes - Icon Grid - Show after age group for Kids, or after content category for Adults */}
        {filters.selectedCategory && 
         filters.selectedContentCategories.length > 0 &&
         (filters.selectedCategory !== 'Kid' || filters.selectedAgeGroup) &&
         availableThemes.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Themes
            </label>
            <div className="grid grid-cols-4 gap-3">
              {availableThemes.map((theme) => {
                const isSelected = filters.selectedThemes.includes(theme.name);
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeToggle(theme.name)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-primary/20 border-2 border-primary' 
                        : 'bg-card border-2 border-border hover:border-primary/50'
                    }`}
                  >
                    {theme.icon_svg_url && (
                      <img 
                        src={theme.icon_svg_url} 
                        alt={theme.name}
                        className="w-8 h-8"
                      />
                    )}
                    <span className="text-xs font-medium text-center leading-tight">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Section with Expand/Collapse */}
      <div className="relative">
        {/* Expand Arrow */}
        {filteredMeditations.length > 0 && !resultsExpanded && (
          <div className="px-4 mb-4 flex justify-center">
            <button
              onClick={() => setResultsExpanded(true)}
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="Expand results"
            >
              <ChevronsUp className="w-8 h-8" />
            </button>
          </div>
        )}

        {/* Expanded Results View */}
        {resultsExpanded && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-24 animate-slide-in-up">
            {/* Header with Filter Summary */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 pb-4">
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gradient-primary">
                    {sortedMeditations.length} Results
                  </h2>
                </div>

                {/* Filter Summary Pills */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {filters.selectedCategory && (
                      <Badge variant="secondary" className="text-xs">
                        {formatCategoryName(filters.selectedCategory)}
                      </Badge>
                    )}
                    {filters.selectedContentCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {filters.selectedAgeGroup && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.selectedAgeGroup}
                      </Badge>
                    )}
                    {filters.selectedThemes.map(theme => (
                      <Badge key={theme} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                    {filters.searchQuery && (
                      <Badge variant="secondary" className="text-xs">
                        "{filters.searchQuery}"
                      </Badge>
                    )}
                  </div>
                )}

                {/* Media Type Filter */}
                <Select value={mediaType} onValueChange={(value: MediaType) => setMediaType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="all">Media Type</SelectItem>
                    <SelectItem value="audio">Audio Only</SelectItem>
                    <SelectItem value="video">Video Only</SelectItem>
                  </SelectContent>
                </Select>

                {/* Collapse Arrow */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setResultsExpanded(false)}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="Collapse results"
                  >
                    <ChevronsDown className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="px-4 pt-4">
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
            </div>
          </div>
        )}

        {/* Collapsed Results Preview */}
        {!resultsExpanded && filteredMeditations.length > 0 && (
          <div className="px-4">
            <div className="grid grid-cols-2 gap-4 pb-6">
              {displayedMeditations.slice(0, 4).map((meditation) => (
                <MeditationCard key={meditation.id} meditation={meditation} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredMeditations.length === 0 && (
          <div className="px-4">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No meditations found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditations;