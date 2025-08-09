import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortControlsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export default function SortControls({ sortBy, setSortBy, sortOrder, setSortOrder }: SortControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none bg-gray-800/50 text-gray-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A024] cursor-pointer"
        >
          <option value="">Sort by</option>
          <option value="price">Price</option>
          <option value="country">Country</option>
          <option value="category">Category</option>
          <option value="marketplace">Source</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="bg-gray-800/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>
    </div>
  );
}