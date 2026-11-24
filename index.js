import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Middleware
app.use(cors());
app.use(express.json()); // This is required to read JSON sent from the frontend!

// ==========================================
// DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create a "Model" for how a favorite movie should be saved
const favoriteSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  title: String,
  poster_path: String,
  release_date: String
});
const Favorite = mongoose.model('Favorite', favoriteSchema);

// ==========================================
// ROUTES
// ==========================================

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// GET Movies (Pagination)
app.get('/api/movies', async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();
    res.json({ movies: data.results, totalPages: data.total_pages });
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET Movie Details
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// ==========================================
// FAVORITES ROUTES
// ==========================================

// GET all favorites
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST a new favorite
app.post('/api/favorites', async (req, res) => {
  try {
    const { movieId, title, poster_path, release_date } = req.body;
    
    // Check if it already exists to avoid duplicates
    const existing = await Favorite.findOne({ movieId });
    if (existing) {
      return res.status(400).json({ error: 'Movie already in favorites' });
    }

    const newFavorite = new Favorite({ movieId, title, poster_path, release_date });
    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (error) {
    console.error('Error adding favorite:', error.message);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
export default app;