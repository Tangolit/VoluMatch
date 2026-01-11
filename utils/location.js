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
 * Also attaches calculated distance to each opportunity for display
 * @param {Array} opportunities - Array of opportunity objects
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {number} maxDistance - Maximum distance in miles (default: 25)
 * @returns {Array} Filtered opportunities within distance, with distance property added
 */
export const filterOpportunitiesByLocation = (opportunities, userLocation, maxDistance = 25) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    // If no valid user location, return opportunities without distance filtering
    // but still try to preserve any existing distance data
    return opportunities;
  }
  
  // Validate maxDistance
  const validMaxDistance = typeof maxDistance === 'number' && maxDistance > 0 ? maxDistance : 25;
  
  return opportunities
    .map(opportunity => {
      // Handle various location data formats
      const oppLocation = opportunity.location;
      
      // Try to extract lat/lng from different possible formats
      let lat = null;
      let lng = null;
      
      if (oppLocation) {
        if (typeof oppLocation.latitude === 'number' && typeof oppLocation.longitude === 'number') {
          lat = oppLocation.latitude;
          lng = oppLocation.longitude;
        } else if (typeof oppLocation.lat === 'number' && typeof oppLocation.lng === 'number') {
          lat = oppLocation.lat;
          lng = oppLocation.lng;
        } else if (typeof oppLocation.coords === 'object' && oppLocation.coords) {
          lat = oppLocation.coords.latitude || oppLocation.coords.lat;
          lng = oppLocation.coords.longitude || oppLocation.coords.lng;
        }
      }
      
      // If we can't determine location, mark as unknown distance
      if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        return {
          ...opportunity,
          calculatedDistance: null,
          distanceText: 'Distance unknown'
        };
      }
      
      // Calculate distance
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        lat,
        lng
      );
      
      // Round to 1 decimal place
      const roundedDistance = Math.round(distance * 10) / 10;
      
      return {
        ...opportunity,
        calculatedDistance: roundedDistance,
        distanceText: roundedDistance < 1 ? 'Less than 1 mile away' : `${roundedDistance} miles away`
      };
    })
    .filter(opportunity => {
      // If distance couldn't be calculated, include it (don't exclude valid opportunities)
      if (opportunity.calculatedDistance === null) {
        return true;
      }
      // Filter by max distance
      return opportunity.calculatedDistance <= validMaxDistance;
    })
    .sort((a, b) => {
      // Sort by distance (closest first), with unknown distances at the end
      if (a.calculatedDistance === null && b.calculatedDistance === null) return 0;
      if (a.calculatedDistance === null) return 1;
      if (b.calculatedDistance === null) return -1;
      return a.calculatedDistance - b.calculatedDistance;
    });
};

/**
 * Get distance between user and a specific opportunity
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {Object} opportunity - Opportunity object with location data
 * @returns {number|null} Distance in miles or null if can't be calculated
 */
export const getOpportunityDistance = (userLocation, opportunity) => {
  if (!userLocation?.latitude || !userLocation?.longitude) return null;
  
  const oppLocation = opportunity?.location;
  if (!oppLocation) return null;
  
  const lat = oppLocation.latitude || oppLocation.lat;
  const lng = oppLocation.longitude || oppLocation.lng;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  
  return calculateDistance(userLocation.latitude, userLocation.longitude, lat, lng);
};

