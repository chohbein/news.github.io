const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
};

const app = express();
require('dotenv').config();

// Use CORS
app.use(cors(corsOptions));  // Enable all CORS requests
app.use(express.json());

// Use port 5000 for Express server
const port = process.env.PORT || 5000;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },  // Use SSL for AWS RDS
});


app.get('/api/cards', async (req, res) => {
  const sqlquery = `
  SELECT 
    sa.simart_id,
    sa.similar_weight,
    json_agg(DISTINCT kw.keyword) AS keywords,
    a.article_id,
    a.title,
    a.url,
    a.date,
    a.article_section,
    a.section_url,
    a.article_source,
    a.image,
    a.subheading
  FROM similar_articles sa
  JOIN junct_simart_articles jsa ON jsa.simart_id = sa.simart_id
  JOIN articles a ON a.article_id = jsa.article_id
  JOIN junct_simart_keywords jsk ON jsk.simart_id = sa.simart_id
  JOIN keywords kw ON kw.keyword_id = jsk.keyword_id
  WHERE sa.similar_weight >= 0.8
    AND EXISTS (
      SELECT 1
      FROM articles a2 
      JOIN junct_simart_articles jsa2 ON jsa2.article_id = a2.article_id
      WHERE jsa2.simart_id = sa.simart_id
      AND a2.date >= NOW() - INTERVAL '2 days'
    )
  GROUP BY sa.simart_id, sa.similar_weight, a.article_id, a.title, a.url, a.date, a.article_section, a.section_url, a.article_source, a.image, a.subheading
  ORDER BY a.date DESC;`;
  
  try {
    // First query - get articles with date filter
    const result = await pool.query(sqlquery);
    const articles = result.rows;
    
    // Get the simart_ids from the filtered results
    const simartIds = articles.map(article => article.simart_id);
    
    // Only get summaries if we have articles
    if (simartIds.length > 0) {
      // Second query - get summaries for ONLY the filtered simart_ids
      const summaryQuery = `
        SELECT simart_id, summary
        FROM similar_article_summaries
        WHERE simart_id = ANY($1)`;
        
      const summaryResult = await pool.query(summaryQuery, [simartIds]);
      
      // Create a lookup map for summaries by simart_id
      const summaryMap = {};
      summaryResult.rows.forEach(row => {
        summaryMap[row.simart_id] = row.summary;
      });
      
      // Add summary to each article
      articles.forEach(article => {
        article.summary = summaryMap[article.simart_id] || null;
      });
    }
    
    // Send the combined data
    res.json(articles);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Error fetching data');
  }
});

app.post('/api/articles-by-keywords', async (req, res) => {
  const keywords = req.body.keywords;  // Expecting an array of keywords
  const offset = req.body.offset || 0;

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: 'Keywords array is required' });
  }

  try {
    const query = `
      SELECT DISTINCT a.* FROM articles a
      JOIN junct_article_keywords jak ON a.article_id = jak.article_id
      JOIN keywords kw ON jak.keyword_id = kw.keyword_id
      WHERE kw.keyword = ANY($1::text[])
      ORDER BY a.date DESC;
    `;
    const { rows } = await pool.query(query, [keywords]);
    res.json({ articles: rows });
  } catch (error) {
    console.error('Error querying articles by keywords:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
