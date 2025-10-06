import express from 'express';
import { query as queryValidator } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { getAllCities, searchCities, calculateDistance } from '../data/locationData.js';

const router = express.Router();

// Get all available cities
router.get('/cities', [
  queryValidator('search').optional().isString().isLength({ min: 1, max: 100 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    
    let cities;
    if (search) {
      cities = searchCities(search);
    } else {
      cities = getAllCities().slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        cities,
        total: cities.length
      }
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
});

// Get cities by country
router.get('/cities/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const allCities = getAllCities();
    
    const cities = allCities.filter(city => 
      city.country.toLowerCase() === country.toLowerCase()
    );
    
    res.json({
      success: true,
      data: {
        cities,
        country,
        total: cities.length
      }
    });
  } catch (error) {
    console.error('Get cities by country error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
});

// Get nearby cities based on coordinates
router.get('/cities/nearby', authenticateToken, [
  queryValidator('lat').isFloat(),
  queryValidator('lng').isFloat(),
  queryValidator('radius').optional().isInt({ min: 1, max: 500 }).default(50)
], async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseInt(radius);
    
    const allCities = getAllCities();
    
    const nearbyCities = allCities
      .map(city => ({
        ...city,
        distance: calculateDistance(userLat, userLng, city.lat, city.lng)
      }))
      .filter(city => city.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
    
    res.json({
      success: true,
      data: {
        cities: nearbyCities,
        center: { lat: userLat, lng: userLng },
        radius: searchRadius,
        total: nearbyCities.length
      }
    });
  } catch (error) {
    console.error('Get nearby cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby cities'
    });
  }
});

// Get location statistics
router.get('/stats', async (req, res) => {
  try {
    const allCities = getAllCities();
    
    // Group by continent and country
    const stats = {};
    allCities.forEach(city => {
      if (!stats[city.continent]) {
        stats[city.continent] = {};
      }
      if (!stats[city.continent][city.country]) {
        stats[city.continent][city.country] = 0;
      }
      stats[city.continent][city.country]++;
    });
    
    const summary = {
      totalCities: allCities.length,
      continents: Object.keys(stats).length,
      countries: Object.values(stats).reduce((acc, countries) => acc + Object.keys(countries).length, 0),
      byContinent: stats
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics'
    });
  }
});

export default router;