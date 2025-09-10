import { useState } from 'react';
import { Search, ArrowLeft, X } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import { mockAgeGroups, mockThemes } from '../data/mockData';
import MeditationCard from '../components/MeditationCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type FilterStep = 'category' | 'ageGroup' | 'themes' | 'results';

const Meditations = () => {
  const { filteredMeditations, filters, setFilters, clearFilters } = useMeditationStore();
  const [currentStep, setCurrentStep] = useState<FilterStep>('category');

  const categories = ['Kids', 'Adults'] as const;
  const kidsAgeGroups = mockAgeGroups.filter(ag => ag.category_id === '1');

  const handleCategorySelect = (category: 'Kids' | 'Adults') => {
    setFilters({ 
      selectedCategory: category,
      selectedAgeGroup: null,
      selectedThemes: []
    });
    
    if (category === 'Kids') {
      setCurrentStep('ageGroup');
    } else {
      setCurrentStep('themes');
    }
  };

  const handleAgeGroupSelect = (ageGroup: string) => {
    setFilters({ selectedAgeGroup: ageGroup });
    setCurrentStep('themes');
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

  const handleBack = () => {
    if (currentStep === 'ageGroup') {
      setCurrentStep('category');
      setFilters({ selectedCategory: null, selectedAgeGroup: null, selectedThemes: [] });
    } else if (currentStep === 'themes') {
      if (filters.selectedCategory === 'Kids') {
        setCurrentStep('ageGroup');
        setFilters({ selectedAgeGroup: null, selectedThemes: [] });
      } else {
        setCurrentStep('category');
        setFilters({ selectedCategory: null, selectedThemes: [] });
      }
    }
  };

  const handleClearAll = () => {
    clearFilters();
    setCurrentStep('category');
  };

  const handleViewResults = () => {
    setCurrentStep('results');
  };

  const hasActiveFilters = filters.selectedCategory || filters.selectedAgeGroup || filters.selectedThemes.length > 0 || filters.searchQuery;
  const canProceed = currentStep === 'themes' && (filters.selectedThemes.length > 0 || filters.selectedCategory === 'Adults');

  return (
    <div className="pb-24 pt-6 min-h-screen">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {currentStep !== 'category' && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gradient-primary flex-1">
            {currentStep === 'category' && 'Choose Category'}
            {currentStep === 'ageGroup' && 'Choose Age Group'}
            {currentStep === 'themes' && 'Choose Themes'}
            {currentStep === 'results' && 'Your Meditations'}
          </h1>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="text-destructive p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Search (always visible) */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search meditations..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-card border-border rounded-xl"
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && currentStep !== 'category' && (
          <div className="mb-6">
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
      </div>

      {/* Filter Steps */}
      <div className="px-4">
        {currentStep === 'category' && (
          <div className="space-y-8 mb-8">
            <p className="text-muted-foreground text-xl text-center px-4">
              Who will be meditating today?
            </p>
            <div className="space-y-6 px-2">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full h-24 text-xl font-bold rounded-2xl border-2 transition-all shadow-lg ${
                    index === 0 
                      ? 'bg-gradient-to-br from-primary/15 to-secondary/15 border-primary/40 hover:from-primary/25 hover:to-secondary/25 hover:border-primary/60 hover:shadow-xl' 
                      : 'bg-gradient-to-br from-accent/15 to-primary/15 border-accent/40 hover:from-accent/25 hover:to-primary/25 hover:border-accent/60 hover:shadow-xl'
                  }`}
                >
                  Peaceful {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'ageGroup' && filters.selectedCategory === 'Kids' && (
          <div className="space-y-8 mb-8">
            <p className="text-muted-foreground text-xl text-center px-4">
              What's your age group?
            </p>
            <div className="grid grid-cols-2 gap-6 px-2">
              {kidsAgeGroups.map((ageGroup, index) => (
                <Button
                  key={ageGroup.id}
                  variant="outline"
                  onClick={() => handleAgeGroupSelect(ageGroup.label)}
                  className={`h-24 text-lg font-bold rounded-2xl border-2 transition-all shadow-lg ${
                    index % 3 === 0 
                      ? 'bg-gradient-to-br from-primary/15 to-accent/15 border-primary/40 hover:from-primary/25 hover:to-accent/25 hover:border-primary/60 hover:shadow-xl'
                      : index % 3 === 1
                      ? 'bg-gradient-to-br from-secondary/15 to-primary/15 border-secondary/40 hover:from-secondary/25 hover:to-primary/25 hover:border-secondary/60 hover:shadow-xl'
                      : 'bg-gradient-to-br from-accent/15 to-secondary/15 border-accent/40 hover:from-accent/25 hover:to-secondary/25 hover:border-accent/60 hover:shadow-xl'
                  }`}
                >
                  {ageGroup.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'themes' && (
          <div className="space-y-8 mb-8">
            <p className="text-muted-foreground text-xl text-center px-4">
              What would you like to focus on? (Select one or more)
            </p>
            <div className="grid grid-cols-2 gap-6 px-2">
              {mockThemes.map((theme, index) => (
                <Button
                  key={theme.id}
                  variant={filters.selectedThemes.includes(theme.name) ? "default" : "outline"}
                  onClick={() => handleThemeToggle(theme.name)}
                  className={`h-24 flex flex-col items-center gap-2 text-base font-bold rounded-2xl border-2 transition-all shadow-lg ${
                    !filters.selectedThemes.includes(theme.name) 
                      ? index % 4 === 0 
                        ? 'bg-gradient-to-br from-primary/15 to-secondary/15 border-primary/40 hover:from-primary/25 hover:to-secondary/25 hover:border-primary/60 hover:shadow-xl'
                        : index % 4 === 1
                        ? 'bg-gradient-to-br from-secondary/15 to-accent/15 border-secondary/40 hover:from-secondary/25 hover:to-accent/25 hover:border-secondary/60 hover:shadow-xl'
                        : index % 4 === 2
                        ? 'bg-gradient-to-br from-accent/15 to-primary/15 border-accent/40 hover:from-accent/25 hover:to-primary/25 hover:border-accent/60 hover:shadow-xl'
                        : 'bg-gradient-to-br from-muted/25 to-primary/15 border-muted/50 hover:from-muted/35 hover:to-primary/25 hover:border-muted/70 hover:shadow-xl'
                      : 'shadow-xl'
                  }`}
                >
                  <span className="text-2xl">{theme.icon}</span>
                  <span className="text-sm leading-tight text-center">{theme.name}</span>
                </Button>
              ))}
            </div>
            
            {canProceed && (
              <div className="px-2">
                <Button
                  onClick={handleViewResults}
                  className="w-full h-14 mt-8 text-xl font-bold rounded-2xl shadow-lg"
                >
                  View Meditations ({filteredMeditations.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'results' && (
          <div>
            {filteredMeditations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No meditations found</h3>
                <p className="text-muted-foreground mb-4">
                  Try going back and selecting different options
                </p>
                <Button onClick={handleBack} variant="outline">
                  Go Back
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
        )}

        {/* Show meditation cards at bottom when not on results step and there are filters applied */}
        {currentStep !== 'results' && filteredMeditations.length > 0 && hasActiveFilters && (
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview ({filteredMeditations.length})</h3>
              {canProceed && (
                <Button onClick={handleViewResults} variant="outline" size="sm">
                  View All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredMeditations.slice(0, 4).map((meditation) => (
                <MeditationCard key={meditation.id} meditation={meditation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditations;