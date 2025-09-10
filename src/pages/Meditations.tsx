import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import { mockAgeGroups, mockThemes } from '../data/mockData';
import MeditationCard from '../components/MeditationCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Meditations = () => {
  const { filteredMeditations, filters, setFilters, clearFilters } = useMeditationStore();
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Kids', 'Adults'] as const;
  const kidsAgeGroups = mockAgeGroups.filter(ag => ag.category_id === '1');

  const handleCategorySelect = (category: 'Kids' | 'Adults') => {
    setFilters({ 
      selectedCategory: category,
      selectedAgeGroup: null, // Reset age group when changing category
      selectedThemes: [] // Reset themes when changing category
    });
  };

  const handleAgeGroupSelect = (ageGroup: string) => {
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

  const hasActiveFilters = filters.selectedCategory || filters.selectedAgeGroup || filters.selectedThemes.length > 0 || filters.searchQuery;

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold text-gradient-primary mb-4">
          Meditation Library
        </h1>

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

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 mb-6 space-y-4">
          {/* Category Selection */}
          <div>
            <h3 className="font-semibold mb-3">Category</h3>
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

          {/* Age Group Selection (only for Kids category) */}
          {filters.selectedCategory === 'Kids' && (
            <div>
              <h3 className="font-semibold mb-3">Age Group</h3>
              <div className="grid grid-cols-2 gap-2">
                {kidsAgeGroups.map((ageGroup) => (
                  <Button
                    key={ageGroup.id}
                    variant={filters.selectedAgeGroup === ageGroup.label ? "default" : "outline"}
                    onClick={() => handleAgeGroupSelect(ageGroup.label)}
                    size="sm"
                  >
                    {ageGroup.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div>
            <h3 className="font-semibold mb-3">Themes</h3>
            <div className="flex flex-wrap gap-2">
              {mockThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={filters.selectedThemes.includes(theme.name) ? "default" : "outline"}
                  onClick={() => handleThemeToggle(theme.name)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <span>{theme.icon}</span>
                  {theme.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {filters.selectedCategory && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {filters.selectedCategory}
              </span>
            )}
            {filters.selectedAgeGroup && (
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                {filters.selectedAgeGroup}
              </span>
            )}
            {filters.selectedThemes.map((theme) => (
              <span key={theme} className="bg-accent/10 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                {mockThemes.find(t => t.name === theme)?.icon} {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-4">
        {filteredMeditations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No meditations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredMeditations.length} meditation{filteredMeditations.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {filteredMeditations.map((meditation) => (
                <MeditationCard key={meditation.id} meditation={meditation} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Meditations;