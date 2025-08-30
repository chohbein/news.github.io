import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SearchPage from './searchpage';
import Modal from './Modal'; // Import the Modal component
import KeywordArticles from './KeywordArticles';  //keyword articles import

function App() {
  const [groupedArticles, setGroupedArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get('https://news-github-io.onrender.com/api/cards')
      .then(response => {
        console.log('Fetched articles:', response.data);
        const grouped = response.data.reduce((acc, article) => {
          const simartId = article.simart_id;
          if (!acc[simartId]) {
            acc[simartId] = [];
          }
          acc[simartId].push(article);
          return acc;
        }, {});

        setGroupedArticles(grouped);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        setLoading(false);
      });
  }, []);

  const findShortestArticleWithImage = (articles) => {
    if (!articles || articles.length === 0) return null;
    const articlesWithImage = articles.filter(article => {
      const isStringNan = article.image === "NaN";
      const hasValidImage = (
        article.image &&
        typeof article.image === 'string' &&
        article.image.trim() !== '' &&
        !isStringNan
      );
      return hasValidImage;
    });

    if (articlesWithImage.length > 0) {
      return articlesWithImage.reduce((shortest, current) =>
        current.title.length < shortest.title.length ? current : shortest
      );
    }
    return articles.reduce((shortest, current) =>
      current.title.length < shortest.title.length ? current : shortest
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openModal = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  const handleClickOutside = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
  };

  if (loading) {
    return <div>Loading articles...</div>;
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">News!</div>
            <nav>
              <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/search">Search Articles</Link></li>
                <li><a href="#about">About</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={(
            <main className="main-content">
              {Object.keys(groupedArticles).length > 0 ? (
                Object.keys(groupedArticles).map(simartId => {
                  const shortestArticle = findShortestArticleWithImage(groupedArticles[simartId]);
                  return (
                    <div
                      key={simartId}
                      className="card"
                      onClick={() => openModal(groupedArticles[simartId])}
                      style={{ cursor: 'pointer' }}
                    >
                      {shortestArticle && (
                        <>
                          <h2>{shortestArticle.title}</h2>
                          <p>{formatDate(shortestArticle.date)}</p>
                          <img src={shortestArticle.image} alt='' className="article-image" />
                        </>
                      )}
                      <p>As Covered By:</p>
                      <ul>
                        {groupedArticles[simartId].map(article => (
                          <li key={article.article_id}>
                            <p><a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>{article.article_source}</a></p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              ) : (
                <p>No articles found</p>
              )}

              {isModalOpen && selectedGroup && (
                <Modal onClose={closeModal} articles={selectedGroup} handleClickOutside={handleClickOutside} />
              )}
            </main>
          )} />

          <Route path="/search" element={<SearchPage />} />
          <Route path="/articles/keyword/:keyword" element={<KeywordArticles />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
