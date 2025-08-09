import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  id: string;
  title: string;
  count: number;
}

interface FilterGroup {
  title: string;
  options: FilterOption[];
  selected: string[];
}

interface StandardFiltersProps {
  filters: {
    categories: FilterGroup;
    suppliers: FilterGroup;
    sources: FilterGroup;
    countries: FilterGroup;
  };
  onFilterChange: (group: keyof StandardFiltersProps['filters'], value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  activeDropdown: string | null;
  setActiveDropdown: (dropdown: string | null) => void;
  showCategories?: boolean;
  showSuppliers?: boolean;
  showSources?: boolean;
  showCountries?: boolean;
}

export default function StandardFilters({
  filters,
  onFilterChange,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  activeDropdown,
  setActiveDropdown,
  showCategories = true,
  showSuppliers = true,
  showSources = true,
  showCountries = true
}: StandardFiltersProps) {
  const filterGroups = [
    { key: 'categories' as const, show: showCategories },
    { key: 'suppliers' as const, show: showSuppliers },
    { key: 'sources' as const, show: showSources },
    { key: 'countries' as const, show: showCountries }
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {filterGroups.map(({ key, show }) => {
        if (!show) return null;
        
        const group = filters[key];
        return (
          <div key={key} className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors text-sm"
            >
              {group.title}
              {group.selected.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {group.selected.length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === key && (
              <div className="absolute z-10 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {group.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={group.selected.includes(option.title)}
                          onChange={() => onFilterChange(key, option.title)}
                          className="rounded border-gray-600 text-[#F4A024] focus:ring-[#F4A024] w-4 h-4"
                        />
                        <span className="ml-2 text-gray-300 text-sm">{option.title}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{option.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none bg-gray-800/50 text-gray-300 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A024] cursor-pointer text-sm"
        >
          <option value="">Sort by</option>
          <option value="price">Price</option>
          <option value="country">Country</option>
          <option value="category">Category</option>
          <option value="marketplace">Source</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="bg-gray-800/50 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-sm"
      >
        {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
      </button>
    </div>
  );
}