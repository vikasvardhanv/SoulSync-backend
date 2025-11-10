// Geocoding and autocomplete service abstraction
// Supports multiple providers: OPENCAGE, NOMINATIM (OSM), GOOGLE (placeholder)
// Falls back gracefully when API key/provider missing.

const PROVIDER = (process.env.GEOCODING_PROVIDER || 'OPENCAGE').toUpperCase();
const API_KEY = process.env.GEOCODING_API_KEY;

// Normalize provider-specific result into unified shape
function normalizeResult(raw) {
  if (!raw) return null;
  // OpenCage style
  if (raw.geometry && raw.components) {
    return {
      latitude: raw.geometry.lat,
      longitude: raw.geometry.lng,
      formattedAddress: raw.formatted,
      city: raw.components.city || raw.components.town || raw.components.village || raw.components.county || null,
      state: raw.components.state || null,
      country: raw.components.country || null
    };
  }
  // Nominatim style
  if (raw.lat && raw.lon && raw.display_name) {
    return {
      latitude: parseFloat(raw.lat),
      longitude: parseFloat(raw.lon),
      formattedAddress: raw.display_name,
      city: raw.address?.city || raw.address?.town || raw.address?.village || raw.address?.county || null,
      state: raw.address?.state || null,
      country: raw.address?.country || null
    };
  }
  // Google style (placeholder)
  if (raw.geometry && raw.geometry.location) {
    const components = raw.address_components || [];
    const getPart = (types) => {
      const comp = components.find(c => types.every(t => c.types.includes(t)));
      return comp ? comp.long_name : null;
    };
    return {
      latitude: raw.geometry.location.lat,
      longitude: raw.geometry.location.lng,
      formattedAddress: raw.formatted_address,
      city: getPart(['locality']) || getPart(['administrative_area_level_2']) || null,
      state: getPart(['administrative_area_level_1']) || null,
      country: getPart(['country']) || null
    };
  }
  return null;
}

async function geocodeAddress(address) {
  if (!address || address.length < 3) {
    return { success: false, message: 'Address too short', candidates: [] };
  }
  if (!API_KEY && PROVIDER !== 'NOMINATIM') {
    console.warn('GEOCODING_API_KEY missing – returning empty result');
    return { success: false, message: 'Geocoding API key not configured', candidates: [] };
  }

  try {
    let url;
    switch (PROVIDER) {
      case 'OPENCAGE':
        url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${API_KEY}&limit=5&no_annotations=1`;
        break;
      case 'NOMINATIM':
        url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(address)}`;
        break;
      case 'GOOGLE':
        url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
        break;
      default:
        return { success: false, message: 'Unsupported provider', candidates: [] };
    }

    const resp = await fetch(url, {
      headers: PROVIDER === 'NOMINATIM' ? { 'User-Agent': 'SoulSync/1.0 (contact@soulsync.solutions)' } : {}
    });
    if (!resp.ok) {
      return { success: false, message: `Provider error HTTP ${resp.status}`, candidates: [] };
    }
    const data = await resp.json();

    let results = [];
    if (PROVIDER === 'OPENCAGE') {
      results = (data.results || []).map(normalizeResult).filter(Boolean);
    } else if (PROVIDER === 'NOMINATIM') {
      results = (data || []).map(item => {
        item.address = item.address || {}; // ensure address present
        return normalizeResult(item);
      }).filter(Boolean);
    } else if (PROVIDER === 'GOOGLE') {
      results = (data.results || []).map(normalizeResult).filter(Boolean);
    }

    if (results.length === 0) {
      return { success: false, message: 'No geocoding results', candidates: [] };
    }

    return {
      success: true,
      message: 'Geocoding successful',
      candidates: results,
      best: results[0]
    };
  } catch (err) {
    console.error('Geocode error:', err);
    return { success: false, message: 'Geocoding failed', candidates: [] };
  }
}

async function autocomplete(query) {
  // For providers without distinct autocomplete endpoint, reuse geocode with partial query
  return geocodeAddress(query);
}

export { geocodeAddress, autocomplete };
 
// Reverse geocoding from coordinates to address
async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { success: false, message: 'Invalid coordinates', candidates: [] };
  }
  if (!API_KEY && PROVIDER !== 'NOMINATIM') {
    console.warn('GEOCODING_API_KEY missing – returning empty result');
    return { success: false, message: 'Geocoding API key not configured', candidates: [] };
  }

  try {
    let url;
    switch (PROVIDER) {
      case 'OPENCAGE':
        url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lat + ',' + lng)}&key=${API_KEY}&limit=1&no_annotations=1`;
        break;
      case 'NOMINATIM':
        url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;
        break;
      case 'GOOGLE':
        url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat + ',' + lng)}&key=${API_KEY}`;
        break;
      default:
        return { success: false, message: 'Unsupported provider', candidates: [] };
    }

    const resp = await fetch(url, {
      headers: PROVIDER === 'NOMINATIM' ? { 'User-Agent': 'SoulSync/1.0 (contact@soulsync.solutions)' } : {}
    });
    if (!resp.ok) {
      return { success: false, message: `Provider error HTTP ${resp.status}`, candidates: [] };
    }
    const data = await resp.json();

    let results = [];
    if (PROVIDER === 'OPENCAGE') {
      results = (data.results || []).map(normalizeResult).filter(Boolean);
    } else if (PROVIDER === 'NOMINATIM') {
      const item = data || null;
      if (item) {
        item.address = item.address || {};
        results = [normalizeResult(item)].filter(Boolean);
      }
    } else if (PROVIDER === 'GOOGLE') {
      results = (data.results || []).map(normalizeResult).filter(Boolean);
    }

    if (results.length === 0) {
      return { success: false, message: 'No reverse geocoding results', candidates: [] };
    }

    return {
      success: true,
      message: 'Reverse geocoding successful',
      candidates: results,
      best: results[0]
    };
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return { success: false, message: 'Reverse geocoding failed', candidates: [] };
  }
}

export { reverseGeocode };
