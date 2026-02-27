// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const toRad = (deg) => {
  return deg * (Math.PI / 180);
};

// Filter jobs by radius from user location
export const filterJobsByRadius = (jobs, userLocation, radiusKm) => {
  if (!userLocation || !jobs || jobs.length === 0) {
    return [];
  }

  return jobs.filter(job => {
    if (!job.location || !job.location.latitude || !job.location.longitude) {
      return false;
    }
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      job.location.latitude,
      job.location.longitude
    );
    
    return distance <= radiusKm;
  });
};

// Format distance for display
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
