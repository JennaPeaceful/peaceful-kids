import { useState, useEffect } from 'react';
import { useMeditationStore } from '../stores/meditationStore';
import MeditationCard from './MeditationCard';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';
import { ScrollArea } from './ui/scroll-area';

interface MeditationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const ITEMS_PER_LOAD = 15;

const MeditationDrawer = ({ isOpen, onClose, title }: MeditationDrawerProps) => {
  const { filteredMeditations } = useMeditationStore();
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    if (isOpen) {
      setDisplayedItems(ITEMS_PER_LOAD);
    }
  }, [isOpen, filteredMeditations]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when user scrolls to bottom
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (displayedItems < filteredMeditations.length) {
        setDisplayedItems(prev => Math.min(prev + ITEMS_PER_LOAD, filteredMeditations.length));
      }
    }
  };

  const displayedMeditations = filteredMeditations.slice(0, displayedItems);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">
            {title} ({filteredMeditations.length} found)
          </DrawerTitle>
        </DrawerHeader>
        
        <ScrollArea className="flex-1 px-4" onScrollCapture={handleScroll}>
          <div className="grid grid-cols-2 gap-4 pb-6">
            {displayedMeditations.map((meditation) => (
              <MeditationCard key={meditation.id} meditation={meditation} />
            ))}
          </div>
          
          {displayedItems < filteredMeditations.length && (
            <div className="text-center py-4 text-muted-foreground">
              Loading more...
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default MeditationDrawer;