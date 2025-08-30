import React, { useState } from 'react';
import './searchpage.css';
import axios from 'axios';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    // Make a GET request to fetch search results
    axios.get(`http://localhost:5000/api/search?query=${query}`)
      .then(response => {
        setSearchResults(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error searching for articles:', error);
        setLoading(false);
      });
  };

  return (
    <div className="search-page">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      <div className="search-results">
        {loading ? (
          <p>Loading...</p>
        ) : (
          searchResults.length > 0 ? (
            searchResults.map(article => (
              <div key={article.article_id} className="search-result">
                <h2>{article.title}</h2>
                <p>{article.article_source}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
              </div>
            ))
          ) : (
            query && <p>No articles found for "{query}"</p>
          )
        )}
      </div>
    </div>
  );
}

export default SearchPage;
