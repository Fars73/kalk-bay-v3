import React from 'react';
import { Car, PersonStanding, Bike, Bus } from 'lucide-react';
import type { TravelMode } from './types';

interface TravelModeSelectorProps {
  selectedMode: TravelMode;
  onModeSelect: (mode: TravelMode) => void;
  disabled?: boolean;
}

const TRAVEL_MODES: Array<{ mode: TravelMode; label: string }> = [
  { mode: 'DRIVING', label: 'Drive' },
  { mode: 'WALKING', label: 'Walk' },
  { mode: 'BICYCLING', label: 'Cycle' },
  { mode: 'TRANSIT', label: 'Transit' }
];

const getTravelModeIcon = (mode: TravelMode) => {
  switch (mode) {
    case 'DRIVING':
      return <Car className="w-5 h-5" />;
    case 'WALKING':
      return <PersonStanding className="w-5 h-5" />;
    case 'BICYCLING':
      return <Bike className="w-5 h-5" />;
    case 'TRANSIT':
      return <Bus className="w-5 h-5" />;
  }
};

export const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TRAVEL_MODES.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onModeSelect(mode)}
          disabled={disabled}
          className={`p-2 rounded-md flex flex-col items-center justify-center space-y-1 transition-all ${
            selectedMode === mode
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={label}
        >
          {getTravelModeIcon(mode)}
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};