import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
    </div>
  );
};