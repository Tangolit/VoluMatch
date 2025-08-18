// Location utilities for distance calculation and filtering
import * as Location from 'expo-location';

/**
 * Request location permissions and get current position
 * @returns {Promise<Object|null>} Location object or null if permission denied
 */
export const getCurrentLocation = async () => {
  try {
    // Request permission to access location
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    // Get current position
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Filter opportunities by distance from user location
 * @param {Array} opportunities - Array of opportunity objects
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {number} maxDistance - Maximum distance in miles (default: 25)
 * @returns {Array} Filtered opportunities within distance
 */
export const filterOpportunitiesByLocation = (opportunities, userLocation, maxDistance = 25) => {
  if (!userLocation) return opportunities;
  
  return opportunities.filter(opportunity => {
    if (!opportunity.location || !opportunity.location.latitude || !opportunity.location.longitude) {
      return false; // Skip opportunities without location data
    }
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      opportunity.location.latitude,
      opportunity.location.longitude
    );
    
    return distance <= maxDistance;
  });
};

