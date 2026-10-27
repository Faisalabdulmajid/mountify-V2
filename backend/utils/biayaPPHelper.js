const pool = require("../config/database");
const logger = require("../logger");

/**
 * Calculate automatic transport cost based on coordinates
 * @param {number} latitude - Trail latitude
 * @param {number} longitude - Trail longitude
 * @returns {Promise<number>} - Calculated transport cost
 */
async function calculateAutoBiayaPP(latitude, longitude) {
  try {
    // Default cost if no coordinates
    if (!latitude || !longitude) {
      return 0;
    }

    // Get tarif_per_km from settings
    const settingsQuery = await pool.query(
      "SELECT value FROM settings WHERE key = 'tarif_per_km' LIMIT 1"
    );
    
    let tarifPerKm = 2000; // Default value
    if (settingsQuery.rows.length > 0) {
      tarifPerKm = parseInt(settingsQuery.rows[0].value) || 2000;
    }

    // Jakarta coordinates as reference point (can be configured)
    const jakartaLat = -6.2088;
    const jakartaLng = 106.8456;

    // Calculate distance using Haversine formula
    const distance = calculateDistance(jakartaLat, jakartaLng, latitude, longitude);
    
    // Calculate cost based on distance
    const transportCost = Math.round(distance * tarifPerKm);
    
    logger.info(`Auto-calculated PP cost: ${transportCost} (distance: ${distance.toFixed(1)}km, tarif: ${tarifPerKm}/km)`);
    
    return transportCost;

  } catch (error) {
    logger.error("Error calculating auto biaya PP:", error);
    return 0;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude  
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Smart biaya PP checker - use manual if available, otherwise auto-calculate
 * @param {Object} trailData - Trail data from form
 * @returns {Promise<Object>} - Processed biaya PP data
 */
async function processBiayaPP(trailData) {
  try {
    const {
      biaya_pulang_pergi,
      biaya_pp_by_city,
      use_city_based_pp,
      latitude,
      longitude
    } = trailData;

    let finalBiayaPP = 0;
    let ppSource = 'none';
    let useCityBased = use_city_based_pp || false;

    // Check if manual data exists
    if (useCityBased && biaya_pp_by_city) {
      try {
        const cityData = typeof biaya_pp_by_city === 'string' 
          ? JSON.parse(biaya_pp_by_city) 
          : biaya_pp_by_city;
        
        // If city-based data exists and has valid entries
        const validCities = Object.entries(cityData).filter(([city, cost]) => city && cost > 0);
        
        if (validCities.length > 0) {
          // Use the first city cost as representative (or calculate average)
          finalBiayaPP = validCities[0][1];
          ppSource = 'manual_city';
        }
      } catch (e) {
        logger.error("Error parsing biaya_pp_by_city:", e);
      }
    } 
    
    // If no city-based, check single manual PP cost
    if (ppSource === 'none' && biaya_pulang_pergi && biaya_pulang_pergi > 0) {
      finalBiayaPP = parseInt(biaya_pulang_pergi);
      ppSource = 'manual_single';
      useCityBased = false;
    }

    // If no manual data found, calculate automatically
    if (ppSource === 'none' && latitude && longitude) {
      finalBiayaPP = await calculateAutoBiayaPP(latitude, longitude);
      ppSource = 'auto_calculated';
      useCityBased = false;
    }

    return {
      biaya_pulang_pergi: finalBiayaPP,
      biaya_pp_by_city: useCityBased ? biaya_pp_by_city : null,
      use_city_based_pp: useCityBased,
      pp_source: ppSource
    };

  } catch (error) {
    logger.error("Error processing biaya PP:", error);
    return {
      biaya_pulang_pergi: 0,
      biaya_pp_by_city: null,
      use_city_based_pp: false,
      pp_source: 'error'
    };
  }
}

module.exports = {
  calculateAutoBiayaPP,
  calculateDistance,
  processBiayaPP
};