import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Modal({ onClose, articles, handleClickOutside }) {
  const navigate = useNavigate();  // Hook called inside component

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the summary from the first article
  const summary = articles[0]?.summary;

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <button className="modal-close" onClick={onClose}>X</button>

        {/* Display keywords as buttons at the top */}
        <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {articles[0].keywords && articles[0].keywords.length > 0 ? (
            articles[0].keywords.map((keyword, index) => (
              <button
                key={index}
                className="keyword-tag"
                type="button"
                onClick={() => {
                  navigate(`/articles/keyword/${encodeURIComponent(keyword)}`);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid white',
                  borderRadius: '3px',
                  color: 'white',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                }}
              >
                {keyword}
              </button>
            ))
          ) : (
            <p style={{ color: 'white' }}>No keywords available</p>
          )}
        </div>

        {/* Two-column layout for articles and summary */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          {/* Left column: Articles list */}
          <div style={{ flex: '1' }}>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {articles.map(article => (
                <li key={article.article_id} style={{ marginBottom: '15px' }}>
                  <p style={{ color: 'white', margin: '0 0 5px 0' }}>
                    <strong>{article.article_source}&nbsp;&nbsp;&nbsp;&nbsp;{formatDate(article.date)}</strong>
                  </p>
                  <p style={{ color: 'white', margin: 0 }}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>
                      <strong>{article.title}</strong>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: Summary */}
          <div style={{
            flex: '1',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px',
            padding: '15px',
            color: 'white'
          }}>
            <h3 style={{ marginTop: 0 }}>Summary</h3>
            {summary ? (
              <p style={{ lineHeight: 1.5 }}>{summary}</p>
            ) : (
              <p style={{ fontStyle: 'italic' }}>No summary available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
