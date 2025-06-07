import React from 'react';
import './output.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export const Searchbar = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  onSuggestionClick,
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleBlur = () => {
    // Add a small delay to allow click on suggestions before hiding them
    setTimeout(() => setShowSuggestions(false), 100);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full max-w-[600px] min-w-[200px] ">
      <div className="flex items-center border border-gray-300 rounded-full focus-within:ring-2  bg-white focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-transparent">
        <input
          type="text"
          placeholder="Search courses..."
          className="flex-grow h-12 px-4 text-base focus:outline-none rounded-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <div className="pr-4">
          <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-[1.5em]" /> 
        </div>
      </div>

      {/* Suggestion List */}
      {showSuggestions && (
        <ul className="absolute bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-2 z-10">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => onSuggestionClick(suggestion.topic)} // Use mouse down to avoid blur before click
            >
              {suggestion.topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
