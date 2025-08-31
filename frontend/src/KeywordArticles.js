import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function KeywordArticles() {
  const { keyword } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://news-github-io.onrender.com/api/articles-by-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: [keyword] }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        setError(err.message || 'Error fetching articles');
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [keyword]);

  console.log("Articles:", articles, "Loading:", loading, "Error:", error);

  if (loading) return <p>Loading articles for "{keyword}"...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (articles.length === 0) return <p>No articles found for "{keyword}"</p>;

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>Articles with keyword: "{keyword}"</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {articles.map(article => (
          <li key={article.article_id} style={{ marginBottom: '15px' }}>
            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue', fontWeight: 'bold' }}>
              {article.title}
            </a>
            <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>
              — {new Date(article.date).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default KeywordArticles;
