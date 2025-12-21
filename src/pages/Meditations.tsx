import { useState, useEffect, useMemo } from 'react';
import { Search, X, Heart, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMeditationStore } from '../stores/meditationStore';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { useUserStore } from '../stores/userStore';
import MeditationCard from '../components/MeditationCard';
import MeditationListItem from '../components/MeditationListItem';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatCategoryName } from '@/lib/utils';
import { getContentCategoryIcon } from '@/lib/contentCategoryIcons';
import { getKidsContentCategoryIcon, hasKidsIcon } from '@/lib/kidsContentCategoryIcons';
import { getContentCategoryColor } from '@/lib/contentCategoryColors';
import categoryBackground from '@/assets/category-icon-background.svg';
import emotionsIcon from '@/assets/emotions.svg';
import logo from '@/assets/logo.svg';
import highlyMeditatedCourseSvg from '@/assets/highly-meditated-course.svg';
import introductionHealingArtsSvg from '@/assets/introduction-healing-arts.svg';
import { APP_URLS } from '@/config/urls';

// Import age group icons
import ages35Icon from '@/assets/age-icons/ages-3-5.png';
import ages38Icon from '@/assets/age-icons/ages-3-8.png';
import ages68Icon from '@/assets/age-icons/ages-6-8.png';
import ages912Icon from '@/assets/age-icons/ages-9-12.png';
import ages917Icon from '@/assets/age-icons/ages-9-17.png';
import ages1317Icon from '@/assets/age-icons/ages-13-17.png';
import allAgesIcon from '@/assets/age-icons/all-ages.png';

type MediaType = 'all' | 'audio' | 'video';

const ITEMS_PER_LOAD = 15;

const Meditations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ageGroup, subscription } = useUserStore();
  const {
    meditations,
    filteredMeditations,
    filters,
    categories,
    courses,
    courseModules,
    themes,
    contentCategories,
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Helper to normalize Adult category checks (handles both 'Adult' and 'Adults')
  const isAdult = filters.selectedCategory?.toLowerCase() === 'adult';

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

  // Scroll to top when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [filters.selectedCategory, filters.selectedAgeGroup, filters.selectedThemes, filters.selectedContentCategories, filters.selectedCourses, filters.selectedModule]);

  const handleCategorySelect = (category: string | null) => {
    if (category === null) {
      clearFilters();
    } else {
      setFilters({ selectedCategory: category });
    }
  };

  const handleCourseToggle = (course: string) => {
    const newCourses = filters.selectedCourses.includes(course)
      ? filters.selectedCourses.filter(c => c !== course)
      : [...filters.selectedCourses, course];
    // Clear module filter when changing courses
    setFilters({ selectedCourses: newCourses, selectedModule: null });
  };

  const handleModuleSelect = (module: number | null) => {
    setFilters({ selectedModule: module });
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

  const handleContentCategorySelect = (contentCategory: string) => {
    // If the category is already selected, clear it (for X button)
    // Otherwise, select it (single-select)
    const isAlreadySelected = filters.selectedContentCategories.includes(contentCategory);
    setFilters({ selectedContentCategories: isAlreadySelected ? [] : [contentCategory] });
  };

  const handleSearchChange = (query: string) => {
    setFilters({ searchQuery: query });
  };

  const handleClearAll = () => {
    clearFilters();
    setMediaType('all');
    setShowFavoritesOnly(false);
  };

  // Navigate back through filter hierarchy
  const handleFilterBack = () => {
    if (filters.selectedModule !== null) {
      // Back from module → course level
      setFilters({ selectedModule: null });
    } else if (filters.selectedCourses.length > 0) {
      // Back from courses → Courses category (show course list)
      setFilters({ selectedCourses: [] });
    } else if (filters.selectedThemes.length > 0) {
      // Back from themes → previous level (age group, content category, or category)
      setFilters({ selectedThemes: [] });
    } else if (filters.selectedContentCategories.length > 0) {
      // Back from content categories (for Adults) → Adult category
      setFilters({ selectedContentCategories: [] });
    } else if (filters.selectedAgeGroup) {
      // Back from age group → Kids or Emotions category
      setFilters({ selectedAgeGroup: null });
    } else if (filters.selectedCategory) {
      // Back from category → all categories view
      setFilters({ selectedCategory: null });
    }
  };

  // Get current filter breadcrumb label
  const getCurrentFilterLabel = () => {
    if (filters.selectedModule !== null) {
      const course = filters.selectedCourses[0];
      return `${course} › Module ${filters.selectedModule}`;
    }
    if (filters.selectedCourses.length > 0) {
      return `Courses › ${filters.selectedCourses[0]}`;
    }
    if (filters.selectedThemes.length > 0) {
      let path = filters.selectedCategory || '';
      if (filters.selectedAgeGroup) {
        path += ` › ${filters.selectedAgeGroup}`;
      }
      if (filters.selectedContentCategories.length > 0) {
        path += ` › ${filters.selectedContentCategories[0]}`;
      }
      path += ` › Themes`;
      return path;
    }
    if (filters.selectedContentCategories.length > 0) {
      return `${filters.selectedCategory} › ${filters.selectedContentCategories[0]}`;
    }
    if (filters.selectedAgeGroup) {
      // Show age group under Emotions or Kids
      const categoryName = filters.selectedCategory === 'Kid' ? 'Kids' : filters.selectedCategory;
      return `${categoryName} › ${filters.selectedAgeGroup}`;
    }
    if (filters.selectedCategory) {
      return filters.selectedCategory === 'Kid' ? 'Kids' : filters.selectedCategory;
    }
    return 'Category';
  };

  
  const hasActiveFilters = filters.selectedCategory || filters.selectedCourses.length > 0 || filters.selectedAgeGroup || filters.selectedThemes.length > 0 || filters.selectedContentCategories.length > 0 || filters.searchQuery || showFavoritesOnly;
  
  // Age group icon mapping
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
  
  // Get filtered theme objects for FilterBreadcrumb and theme display
  // Special case: Emotions category should show emotion-specific themes
  const emotionThemeNames = [
    'Anger', 'Anxiety\\Worry', 'Bedtime', 'Breathwork', 'Calm', 'Energize', 
    'Family Change', 'Focus', 'Frustration', 'Mindfulness Exercises Eating',
    'Mindfulness Exercises Grounding', 'Mindfulness Exercises Teeth Brushing',
    'Mindfulness Exercises Walking', 'Mornings', 'Overwhelm', 'Protection',
    'Reset', 'Rest', 'Sadness', 'Scared', 'Separation Anxiety', 'Somatic Reset',
    'Stress', 'Transitions', 'Upset', 'Kid', 'Sports'
  ];
  
  const availableThemeObjects = themes.filter(theme => {
    if (!filters.selectedCategory) return true;
    if (filters.selectedCategory === 'Emotions') {
      // For Emotions, show themes by name (emotion themes)
      return emotionThemeNames.includes(theme.name);
    }
    return theme.category?.includes(filters.selectedCategory);
  });

  // Get available content categories based on current filtered meditations
  const availableContentCategories = useMemo(() => {
    // Get meditations after category filter is applied
    let categoryFilteredMeditations = meditations;

    if (filters.selectedCategory) {
      categoryFilteredMeditations = meditations.filter(m => {
        const normalizedCategory = m.category?.toLowerCase();
        const normalizedFilter = filters.selectedCategory.toLowerCase();
        return normalizedCategory === normalizedFilter ||
               (normalizedFilter === 'adult' && normalizedCategory === 'adults') ||
               (normalizedFilter === 'adults' && normalizedCategory === 'adult');
      });
    }

    // Get unique content categories from these meditations
    const uniqueContentCategories = new Set<string>();
    categoryFilteredMeditations.forEach(m => {
      m.content_categories?.forEach(cc => uniqueContentCategories.add(cc));
    });

    // Filter contentCategories to only those that exist in current results
    return contentCategories.filter(cc => uniqueContentCategories.has(cc.name));
  }, [meditations, contentCategories, filters.selectedCategory]);

  // Consolidate all filtering and sorting in a single memoized operation
  const sortedMeditations = useMemo(() => {
    // Step 1: Filter by media type
    let result = mediaType === 'all' 
      ? filteredMeditations 
      : filteredMeditations.filter(m => m.media_type === mediaType);

    // Step 2: Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter(m => favorites.includes(m.id));
    }

    // Step 3: Exclude courses when Adult category is selected
    if (isAdult) {
      result = result.filter(m => m.category !== 'Courses');
    }

    // Step 4: Sort only when course filter is active; otherwise preserve store order
    if (filters.selectedCourses.length > 0) {
      return [...result].sort((a, b) => {
        // Sort by module first (nulls last)
        const aModule = a.module ?? Number.MAX_SAFE_INTEGER;
        const bModule = b.module ?? Number.MAX_SAFE_INTEGER;
        if (aModule !== bModule) return aModule - bModule;

        // Then by course_lecture_display_order within module (nulls last)
        const aDisplayOrder = a.course_lecture_display_order ?? Number.MAX_SAFE_INTEGER;
        const bDisplayOrder = b.course_lecture_display_order ?? Number.MAX_SAFE_INTEGER;
        if (aDisplayOrder !== bDisplayOrder) return aDisplayOrder - bDisplayOrder;

        // Tie-breaker: stable by id
        return a.id.localeCompare(b.id);
      });
    }

    // Preserve original order from store when not sorting by course structure
    return result;
  }, [
    filteredMeditations,
    mediaType,
    showFavoritesOnly,
    favorites,
    filters.selectedCategory,
    filters.selectedCourses,
    filters.selectedModule,
    userMeditationUsage,
    user
  ]);

  const displayedMeditations = sortedMeditations.slice(0, displayedItems);
  
  // Create course thumbnails mapping
  const courseThumbnails = courses.reduce((acc, course) => {
    const courseMeditation = meditations.find(m => m.category === 'Courses' && m.courses === course);
    if (courseMeditation) {
      acc[course] = courseMeditation.thumbnail_url || courseMeditation.thumbnail || '';
    }
    return acc;
  }, {} as { [key: string]: string });

  return (
    <div className="pb-24 min-h-screen">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40 px-4 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gradient-primary">
          {t('meditations.title')}
        </h1>
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

        {/* Sticky Controls Bar - Back/Clear All + Category/Results */}
        {hasActiveFilters && (
          <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40 py-3 -mx-4 px-4 mb-4">
            {/* Back and Clear All buttons */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFilterBack}
                className="flex items-center gap-1 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                variant="ghost"
                onClick={handleClearAll}
                className="text-destructive -mr-2"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                {t('meditations.clearAll')}
              </Button>
            </div>
            {/* Category header and results count */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-muted-foreground block">
                  {getCurrentFilterLabel()}
                </label>
                <p className="text-xs text-muted-foreground">
                  {sortedMeditations.length} results
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Selection - Show all available filters */}
        {!filters.selectedCategory && categories.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">{getCurrentFilterLabel()}</label>
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

        {/* Emotions - Age Groups - Show first when Emotions category is selected */}
        {filters.selectedCategory === 'Emotions' && !filters.selectedAgeGroup && ageGroups.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              {getCurrentFilterLabel()}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {ageGroups.filter(ag => ag).map((ageGroup) => {
                const isSelected = filters.selectedAgeGroup === ageGroup;
                const icon = getAgeGroupIcon(ageGroup);
                return (
                  <Button
                    key={ageGroup}
                    variant="outline"
                    onClick={() => handleAgeGroupSelect(isSelected ? null : ageGroup)}
                    className={`relative flex items-center justify-center aspect-[11/5] min-h-[70px] md:min-h-[90px] lg:min-h-[100px] transition-all overflow-hidden ${
                      isSelected
                        ? 'border-2 shadow-lg scale-105'
                        : 'hover:shadow-primary hover:scale-102'
                    }`}
                  >
                    {icon && (
                      <img
                        src={icon}
                        alt={ageGroup}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* DEBUG LOGGING FOR EMOTIONS BUG */}
        {(() => {
          if (filters.selectedCategory === 'Emotions' && filters.selectedAgeGroup) {
            console.log('=== EMOTIONS DEBUG ===');
            console.log('selectedCategory:', filters.selectedCategory);
            console.log('selectedAgeGroup:', filters.selectedAgeGroup);
            console.log('selectedThemes:', filters.selectedThemes);
            console.log('availableThemes.length:', availableThemes.length);
            console.log('availableThemeObjects.length:', availableThemeObjects.length);
            console.log('availableThemeObjects:', availableThemeObjects);
            console.log('Condition check:', {
              hasCategory: filters.selectedCategory === 'Emotions',
              hasAgeGroup: !!filters.selectedAgeGroup,
              noThemesSelected: !filters.selectedThemes.length,
              hasAvailableThemes: availableThemes.length > 0,
              hasAvailableThemeObjects: availableThemeObjects.length > 0
            });
          }
          return null;
        })()}

        {/* Emotions (Themes) - Show when Emotions category AND age group are selected */}
        {filters.selectedCategory === 'Emotions' && filters.selectedAgeGroup && !filters.selectedThemes.length && availableThemes.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              {getCurrentFilterLabel()}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableThemeObjects.map((theme) => {
                // Use database icon URLs (prefer PNG for better compatibility)
                const themeIconUrl = theme.icon_png_url || theme.icon_svg_url || theme.icon;
                return (
                  <Button
                    key={theme.name}
                    variant="outline"
                    onClick={() => handleThemeToggle(theme.name)}
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
                        alt={theme.name}
                        className="absolute inset-0 w-full h-full object-contain p-3"
                      />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight whitespace-normal min-h-[2rem] flex items-center">
                      {theme.name}
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
              {getCurrentFilterLabel()}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {ageGroups.filter(ag => ag).map((ageGroup) => {
                const isSelected = filters.selectedAgeGroup === ageGroup;
                const icon = getAgeGroupIcon(ageGroup);
                return (
                  <Button
                    key={ageGroup}
                    variant="outline"
                    onClick={() => handleAgeGroupSelect(isSelected ? null : ageGroup)}
                    className={`relative flex items-center justify-center aspect-[11/5] min-h-[70px] md:min-h-[90px] lg:min-h-[100px] transition-all overflow-hidden ${
                      isSelected
                        ? 'border-2 shadow-lg scale-105'
                        : 'hover:shadow-primary hover:scale-102'
                    }`}
                  >
                    {icon && (
                      <img
                        src={icon}
                        alt={ageGroup}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Kids Content Categories - Show when age group is selected but no content category yet */}
        {filters.selectedCategory === 'Kid' && filters.selectedAgeGroup && filters.selectedContentCategories.length === 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              {getCurrentFilterLabel()}
            </label>

            {/* Intro Video - only for specific age groups */}
            {['Ages 3-5', 'Ages 6-8', 'Ages 9-12', 'Ages 13-17'].includes(filters.selectedAgeGroup) && (() => {
              const introVideoIds: Record<string, string> = {
                'Ages 3-5': 'd60890a9-64a2-4d6a-8ef0-3d163d137463',
                'Ages 6-8': 'fbf8f878-737f-4cce-a7ae-d6fc8134bf51',
                'Ages 9-12': 'cdfb66af-018f-4646-8758-888c3e67087a',
                'Ages 13-17': 'e9b87204-fb3f-4967-98ab-dbad309511a1',
              };
              const introVideo = meditations.find(m => m.id === introVideoIds[filters.selectedAgeGroup!]);
              if (!introVideo) return null;
              return (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/meditation/${introVideo.id}`)}
                    className="w-full flex items-center gap-4 h-auto p-4 hover:shadow-primary transition-all"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40">
                      <img
                        src={introVideo.thumbnail_url || introVideo.thumbnail || logo}
                        alt={introVideo.public_title || introVideo.title}
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[10px] border-l-primary border-y-[6px] border-y-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium block">{introVideo.public_title || 'Introduction'}</span>
                      <span className="text-xs text-muted-foreground">Watch the intro video</span>
                    </div>
                  </Button>
                </div>
              );
            })()}

            {/* 5 Content Category Boxes - Use colored icons for kids */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {['Meditation', 'Mindfulness Activities', 'Somatic Reset', 'Breathwork', 'Binaurals'].map((categoryName) => {
                // Use colored kids icons based on selected age group
                const kidsIcon = hasKidsIcon(categoryName)
                  ? getKidsContentCategoryIcon(categoryName, filters.selectedAgeGroup)
                  : null;
                const fallbackIcon = getContentCategoryIcon(categoryName);
                const categoryColor = getContentCategoryColor(categoryName);

                return (
                  <Button
                    key={categoryName}
                    variant="outline"
                    onClick={() => handleContentCategorySelect(categoryName)}
                    className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center">
                      {kidsIcon ? (
                        // Kids colored icon - no background needed
                        <img
                          src={kidsIcon}
                          alt=""
                          className="w-full h-full object-contain p-2"
                        />
                      ) : fallbackIcon && categoryColor ? (
                        // Fallback to line-art icon with colored background
                        <>
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundColor: categoryColor,
                              opacity: 0.7
                            }}
                          />
                          <img
                            src={fallbackIcon}
                            alt=""
                            className="relative z-10 w-12 h-12 object-contain"
                          />
                        </>
                      ) : (
                        <img
                          src={categoryBackground}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-70"
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight whitespace-normal min-h-[2rem] flex items-center">
                      {categoryName}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Categories - Show when Adult category is selected */}
        {isAdult && availableContentCategories.length > 0 && filters.selectedContentCategories.length === 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              {getCurrentFilterLabel()}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableContentCategories.map((contentCategory) => {
                const icon = getContentCategoryIcon(contentCategory.name);
                const categoryColor = getContentCategoryColor(contentCategory.name);
                const isSelected = filters.selectedContentCategories.includes(contentCategory.name);
                return (
                  <Button
                    key={contentCategory.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleContentCategorySelect(contentCategory.name)}
                    className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-primary transition-all"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center">
                      {icon && categoryColor ? (
                        <>
                          {/* Colored background at 70% opacity */}
                          <div 
                            className="absolute inset-0" 
                            style={{ 
                              backgroundColor: categoryColor,
                              opacity: 0.7 
                            }}
                          />
                          {/* Dark line art on top */}
                          <img 
                            src={icon}
                            alt=""
                            className="relative z-10 w-12 h-12 object-contain"
                          />
                        </>
                      ) : (
                        <img 
                          src={categoryBackground}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-70"
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight whitespace-normal min-h-[2rem] flex items-center">
                      {contentCategory.name}
                    </span>
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
              {getCurrentFilterLabel()}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {courses.map((course) => {
                // Find a meditation with an SVG thumbnail for this course (prioritize SVGs)
                const courseMeditation = meditations.find(m =>
                  m.category === 'Courses' &&
                  m.courses === course &&
                  (m.thumbnail_url?.includes('.svg') || m.thumbnail?.includes('.svg'))
                ) || meditations.find(m => m.category === 'Courses' && m.courses === course); // Fallback to any meditation

                const thumbnailUrl = courseMeditation?.thumbnail_url || courseMeditation?.thumbnail;

                // Map database paths to imported assets
                let thumbnailSrc = emotionsIcon;
                if (thumbnailUrl === '/highly-meditated-course.svg') {
                  thumbnailSrc = highlyMeditatedCourseSvg;
                } else if (thumbnailUrl === '/introduction-healing-arts.svg') {
                  thumbnailSrc = introductionHealingArtsSvg;
                } else if (thumbnailUrl) {
                  thumbnailSrc = thumbnailUrl;
                }

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
                        src={thumbnailSrc}
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

        {/* Modules - Show when a course is selected */}
        {filters.selectedCourses.length > 0 && (() => {
          // Get unique modules from meditations in selected courses
          const courseMeditations = meditations.filter(m => 
            filters.selectedCourses.includes(m.courses || '')
          );
          const uniqueModules = [...new Set(
            courseMeditations
              .map(m => m.module)
              .filter((mod): mod is number => mod !== null && mod !== undefined)
          )].sort((a, b) => a - b);
          
          return uniqueModules.length > 0 && filters.selectedModule === null ? (
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                {getCurrentFilterLabel()}
              </label>
              <div className="flex flex-col gap-2">
                {uniqueModules.map((module) => {
                  const isSelected = filters.selectedModule === module;
                  
                  // Find the module title from courseModules map
                  const moduleData = Array.from(courseModules.values()).find(m => 
                    m.module_number === module && 
                    filters.selectedCourses.includes(m.course_name)
                  );
                  const moduleTitle = moduleData?.title || '';
                  
                  return (
                    <Button
                      key={module}
                      variant="outline"
                      onClick={() => handleModuleSelect(isSelected ? null : module)}
                      className={`relative w-full flex items-center justify-start gap-3 px-4 py-3 h-auto overflow-hidden transition-all ${
                        isSelected 
                          ? 'border-2 border-primary shadow-lg' 
                          : 'hover:shadow-primary'
                      }`}
                    >
                      <img
                        src={categoryBackground}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                      />
                      <span className="relative z-10 text-base font-bold shrink-0">Module {module}</span>
                      {moduleTitle && (
                        <span className="relative z-10 text-sm font-normal text-left flex-1 truncate">
                          {moduleTitle}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null;
        })()}

        {/* Themes - Icon Grid - Show after age group for Kids or for Adult category */}
        {filters.selectedCategory &&
         (isAdult || (filters.selectedCategory === 'Kid' && filters.selectedAgeGroup)) &&
         availableThemeObjects.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              {getCurrentFilterLabel()}
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

      
      {/* Results Section */}
      <div className="px-4">

        {/* Results Grid or List */}
        {filteredMeditations.length > 0 && (
          <>
            {filters.selectedCourses.length > 0 ? (
              <div className="flex flex-col gap-2 pb-6">
                {displayedMeditations.map((meditation) => (
                  <MeditationListItem
                    key={meditation.id}
                    meditation={meditation}
                    courseThumbnail={meditation.courses ? courseThumbnails[meditation.courses] : undefined}
                  />
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
              <div className="text-center py-6 pb-32">
                <Button
                  variant="secondary"
                  onClick={() => setDisplayedItems(prev =>
                    Math.min(prev + ITEMS_PER_LOAD, sortedMeditations.length)
                  )}
                  className="px-8 bg-muted hover:bg-muted/80 text-foreground border border-border"
                >
                  Load More ({sortedMeditations.length - displayedItems} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {filteredMeditations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No meditations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditations;