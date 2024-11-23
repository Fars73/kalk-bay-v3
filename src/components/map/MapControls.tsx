import React from 'react';
import { Navigation2, Loader2 } from 'lucide-react';
import { TravelModeSelector } from './TravelModeSelector';
import type { TravelMode } from './types';

interface MapControlsProps {
  onCalculateRoute: () => void;
  onClearRoute: () => void;
  selectedMode: TravelMode;
  setSelectedMode: (mode: TravelMode) => void;
  distance: string;
  duration: string;
  isCalculating: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onCalculateRoute,
  onClearRoute,
  selectedMode,
  setSelectedMode,
  distance,
  duration,
  isCalculating
}) => {
  return (
    <div className="absolute top-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 max-w-sm">
      <div className="space-y-4">
        <TravelModeSelector
          selectedMode={selectedMode}
          onModeSelect={setSelectedMode}
          disabled={isCalculating}
        />

        <div className="flex space-x-2">
          <button
            onClick={onCalculateRoute}
            disabled={isCalculating}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Navigation2 className="w-5 h-5 mr-2" />
            )}
            {isCalculating ? 'Calculating...' : 'Get Directions'}
          </button>
          <button
            onClick={onClearRoute}
            disabled={isCalculating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>

        {distance && duration && (
          <div className="text-sm space-y-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="font-medium">Distance: {distance}</p>
            <p className="font-medium">Duration: {duration}</p>
          </div>
        )}
      </div>
    </div>
  );
};