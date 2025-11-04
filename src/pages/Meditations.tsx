import { useState, useEffect } from 'react';
import { Search, X, ChevronsUp, ChevronsDown, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMeditationStore } from '../stores/meditationStore';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { useUserStore } from '../stores/userStore';
import MeditationCard from '../components/MeditationCard';
import MeditationListItem from '../components/MeditationListItem';
import FilterBreadcrumb from '../components/FilterBreadcrumb';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { formatCategoryName } from '@/lib/utils';
import categoryBackground from '@/assets/category-icon-background.svg';
import emotionsIcon from '@/assets/emotions.svg';
import logo from '@/assets/logo.svg';

type MediaType = 'all' | 'audio' | 'video';

const ITEMS_PER_LOAD = 15;

const Meditations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ageGroup, subscription } = useUserStore();
  const { 
    filteredMeditations, 
    filters, 
    categories,
    contentCategories,
    courses, 
    themes, 
    ageGroups, 
    availableThemes,
    userMeditationUsage,
    setFilters, 
    clearFilters, 
    fetchMeditations,
    fetchUserMeditationUsage,
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
    if (user) {
      fetchUserMeditationUsage(user.id);
    }
  }, [user, fetchUserMeditationUsage]);

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

  const handleCourseToggle = (course: string) => {
    const newCourses = filters.selectedCourses.includes(course)
      ? filters.selectedCourses.filter(c => c !== course)
      : [...filters.selectedCourses, course];
    setFilters({ selectedCourses: newCourses });
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

  const hasActiveFilters = filters.selectedCategory || filters.selectedContentCategories.length > 0 || filters.selectedCourses.length > 0 || filters.selectedAgeGroup || filters.selectedThemes.length > 0 || filters.searchQuery || showFavoritesOnly;
  
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
  
  // Get filtered theme objects that don't overlap with content categories (for FilterBreadcrumb and theme display)
  const availableThemeObjects = themes.filter(theme => 
    (!filters.selectedCategory || theme.category?.includes(filters.selectedCategory)) &&
    !filters.selectedContentCategories.includes(theme.name)
  );

  // Get content categories for the selected category - only show categories that have meditations
  const availableContentCategories = filters.selectedCategory 
    ? contentCategories.filter(category => 
        filteredMeditations.some(m => m.content_categories?.includes(category.name))
      )
    : contentCategories.filter(category => 
        filteredMeditations.some(m => m.content_categories?.includes(category.name))
      );

  // Sort meditations and filter by media type and favorites
  const filteredByMediaType = mediaType === 'all' 
    ? filteredMeditations 
    : filteredMeditations.filter(m => m.media_type === mediaType);

  const filteredByFavorites = showFavoritesOnly
    ? filteredByMediaType.filter(m => favorites.includes(m.id))
    : filteredByMediaType;

  const sortedMeditations = [...filteredByFavorites].sort((a, b) => {
    // Priority 1: Most recently played meditations first (if user is authenticated)
    if (userMeditationUsage && user) {
      const aUsage = userMeditationUsage.find(u => u.meditation_id === a.id);
      const bUsage = userMeditationUsage.find(u => u.meditation_id === b.id);
      
      // If A was played but B wasn't, A comes first
      if (aUsage && !bUsage) return -1;
      if (!aUsage && bUsage) return 1;
      
      // If both were played, most recent comes first
      if (aUsage && bUsage) {
        const aTime = new Date(aUsage.updated_at).getTime();
        const bTime = new Date(bUsage.updated_at).getTime();
        if (aTime !== bTime) return bTime - aTime; // Descending (most recent first)
      }
    }
    
    // Priority 2: Free meditations before premium
    if (a.is_free && !b.is_free) return -1;
    if (!a.is_free && b.is_free) return 1;

    // Priority 3: Alphabetical by title
    const aTitle = (a.title || '').toLowerCase();
    const bTitle = (b.title || '').toLowerCase();
    return aTitle > bTitle ? 1 : -1;
  });

  const displayedMeditations = sortedMeditations.slice(0, displayedItems);

  return (
    <div className="pb-24 min-h-screen">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40 px-4 py-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient-primary">
            {t('meditations.title')}
          </h1>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="text-destructive"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              {t('meditations.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <div className="px-4">

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('meditations.searchPlaceholder')}
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-card border-border rounded-xl"
          />
        </div>

        {/* Favorites Filter Toggle */}
        <div className="mb-6">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => {
              if (!user) {
                navigate('/profile');
              } else {
                setShowFavoritesOnly(!showFavoritesOnly);
              }
            }}
            className="w-full"
          >
            <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {!user 
              ? 'Sign in to set favorites'
              : showFavoritesOnly 
                ? t('meditations.showingFavorites') 
                : t('meditations.showFavorites')
            }
          </Button>
        </div>

        {/* Filter Breadcrumb */}
        <FilterBreadcrumb
          selectedCategory={filters.selectedCategory}
          selectedContentCategories={filters.selectedContentCategories}
          selectedCourses={filters.selectedCourses}
          selectedAgeGroup={filters.selectedAgeGroup}
          selectedThemes={filters.selectedThemes}
          contentCategories={availableContentCategories}
          courses={courses}
          ageGroups={ageGroups}
          themes={availableThemeObjects}
          onCategorySelect={handleCategorySelect}
          onContentCategoryToggle={handleContentCategoryToggle}
          onCourseToggle={handleCourseToggle}
          onAgeGroupSelect={handleAgeGroupSelect}
          onThemeToggle={handleThemeToggle}
        />

        {/* Filter Selection - Show all available filters */}
        {!filters.selectedCategory && categories.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories
                .filter(category => {
                  // Hide specific categories
                  const hiddenCategories = [
                    'Mindfulness Exercises Teeth Brushing',
                    'Mindfulness Exercises Walking',
                    'Mindfulness Exercises Eating',
                    'Mindfulness Exercises Grounding',
                    'Miscellaneous'
                  ];
                  if (hiddenCategories.includes(category.name)) {
                    return false;
                  }
                  return true;
                })
                .map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => handleCategorySelect(category.name)}
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                >
                  {(category.thumbnail_svg_url || category.name === 'Emotions') && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                      <img 
                        src={categoryBackground}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                      />
                      <img 
                        src={category.name === 'Emotions' ? emotionsIcon : category.thumbnail_svg_url} 
                        alt={category.display_name}
                        className="absolute inset-0 w-full h-full object-contain p-2 filter brightness-0"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">{category.display_name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Emotions (Themes) - Show when Emotions category is selected */}
        {filters.selectedCategory === 'Emotions' && !filters.selectedThemes.length && availableThemes.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Select an Emotion
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableThemes.map((themeName) => {
                // Map theme names to CDN filenames (handle special characters and misspellings)
                let themeFileName = themeName.replace(/\\/g, '-').replace(/\//g, '-');
                if (themeName === 'Miscellaneous') {
                  themeFileName = 'Misellaneous'; // CDN has misspelled version
                }
                const themeIconUrl = `https://cdn.peacefulkids.app/SVG%20FILES%20NO%20COLOR/CONTENT%20CATEGORY%20NO%20COLOR/${encodeURIComponent(themeFileName)}.svg`;
                return (
                  <Button
                    key={themeName}
                    variant="outline"
                    onClick={() => handleThemeToggle(themeName)}
                    className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <img 
                        src={categoryBackground}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                      />
                      <img 
                        src={themeIconUrl}
                        alt={themeName}
                        className="absolute inset-0 w-full h-full object-contain p-3"
                      />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {themeName}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Age Groups - show for Kid category immediately after Kids is selected */}
        {filters.selectedCategory === 'Kid' && !filters.selectedAgeGroup && ageGroups.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Age Group
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

        {/* Courses - Show when Courses category is selected */}
        {filters.selectedCategory === 'Courses' && !filters.selectedCourses.length && courses.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Courses
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {courses.map((course) => {
                const courseMeditation = filteredMeditations.find(m => m.courses === course);
                const thumbnailUrl = courseMeditation?.thumbnail_url || courseMeditation?.thumbnail;
                
                return (
                  <Button
                    key={course}
                    variant="outline"
                    onClick={() => handleCourseToggle(course)}
                    className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <img 
                        src={categoryBackground}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                      />
                      <img 
                        src={thumbnailUrl || emotionsIcon} 
                        alt={course}
                        className="absolute inset-0 w-full h-full object-contain p-3"
                      />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight px-2 whitespace-normal min-h-[2rem] flex items-center">{course}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Categories - For Kids after age group, for Adults immediately */}
        {filters.selectedCategory && 
         filters.selectedCategory !== 'Courses' &&
         ((filters.selectedCategory === 'Kid' && filters.selectedAgeGroup && !filters.selectedContentCategories.length) ||
          (filters.selectedCategory === 'Adult' && !filters.selectedContentCategories.length)) &&
         availableContentCategories.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Content Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableContentCategories.map((category) => {
                const iconUrl = category.thumbnail_svg_url || category.thumbnail_png_url;
                
                return (
                  <Button
                    key={category.name}
                    variant="outline"
                    onClick={() => handleContentCategoryToggle(category.name)}
                    className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <img 
                        src={categoryBackground}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                      />
                      {iconUrl ? (
                        <img 
                          src={iconUrl} 
                          alt={category.name}
                          className="absolute inset-0 w-full h-full object-contain p-3 filter brightness-0"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-foreground font-bold text-lg">
                          {category.name.split(' ').slice(0, 2).map((word: string) => word[0]).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight px-2 whitespace-normal min-h-[2rem] flex items-center">{category.name}</span>
                  </Button>
                );
              })}
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
              {availableThemeObjects.map((theme) => {
                const isSelected = filters.selectedThemes.includes(theme.name);
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeToggle(theme.name)}
                    className={`no-touch-highlight flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
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

            {/* Results Grid or List */}
            <div className="px-4 pt-4">
              {filters.selectedCourses.length > 0 ? (
                <div className="flex flex-col gap-2 pb-6">
                  {displayedMeditations.map((meditation) => (
                    <MeditationListItem key={meditation.id} meditation={meditation} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
                  {displayedMeditations.map((meditation) => (
                    <MeditationCard key={meditation.id} meditation={meditation} />
                  ))}
                </div>
              )}
              
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
            <ScrollArea className="h-[600px] w-full">
              {filters.selectedCourses.length > 0 ? (
                <div className="flex flex-col gap-2 pb-6 pr-4">
                  {displayedMeditations.map((meditation) => (
                    <MeditationListItem key={meditation.id} meditation={meditation} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6 pr-4">
                  {displayedMeditations.map((meditation) => (
                    <MeditationCard key={meditation.id} meditation={meditation} />
                  ))}
                </div>
              )}
            </ScrollArea>
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