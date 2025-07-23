import React from 'react';

interface SearchHistoryProps {
  recentSearches: string[];
  onSearchClick: (query: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ recentSearches, onSearchClick }) => {
  return (
    <div>
      <h4>Search History</h4>
      {recentSearches.map((search, index) => (
        <div key={index} onClick={() => onSearchClick(search)} style={{ cursor: 'pointer', padding: '4px 0' }}>
          {search}
        </div>
      ))}
    </div>
  );
};

export default SearchHistory;