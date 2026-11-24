import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(cors());

// 1. Hello Route (for testing)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// 2. Movies List Route (UPDATED FOR PAGINATION)
app.get('/api/movies', async (req, res) => {
  try {
    // Read the page number from the URL (e.g., ?page=2). Default to 1.
    const page = req.query.page || 1; 

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Send back an object with movies and totalPages
    res.json({
      movies: data.results,
      totalPages: data.total_pages
    });
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// 3. Movie Details Route
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});