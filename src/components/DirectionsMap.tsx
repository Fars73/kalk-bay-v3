import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { toast } from 'sonner';
import { CHURCH_LOCATION, DEFAULT_ZOOM, MAP_STYLES } from '../config/maps';
import { MapControls } from './map/MapControls';
import { ZoomControls } from './map/ZoomControls';
import type { TravelMode } from './map/types';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const DirectionsMap: React.FC = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<TravelMode>('DRIVING');
  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
  };

  const handleLoadError = (error: Error) => {
    console.error('Error loading Google Maps:', error);
    setMapError('Failed to load Google Maps. Please try again later.');
    toast.error('Failed to load Google Maps');
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Get address for user's location
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results[0] && autocompleteInputRef.current) {
              autocompleteInputRef.current.value = results[0].formatted_address;
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to retrieve your location. Please enter it manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const calculateRoute = async () => {
    if (!originRef.current) {
      toast.error('Please enter your starting point');
      return;
    }

    const place = (originRef.current as any).getPlace();
    if (!place || !place.geometry) {
      toast.error('Please select a valid location from the dropdown');
      return;
    }

    setIsCalculating(true);
    const directionsService = new window.google.maps.DirectionsService();

    try {
      const request = {
        origin: place.geometry.location,
        destination: CHURCH_LOCATION,
        travelMode: window.google.maps.TravelMode[selectedMode],
        optimizeWaypoints: true,
        provideRouteAlternatives: true,
        drivingOptions: selectedMode === 'DRIVING' ? {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS
        } : undefined,
        transitOptions: selectedMode === 'TRANSIT' ? {
          departureTime: new Date(),
          modes: [
            window.google.maps.TransitMode.BUS,
            window.google.maps.TransitMode.RAIL,
            window.google.maps.TransitMode.SUBWAY,
            window.google.maps.TransitMode.TRAIN,
            window.google.maps.TransitMode.TRAM
          ],
          routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
        } : undefined,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: true,
        region: 'za'
      };

      const results = await directionsService.route(request);

      if (results.routes && results.routes.length > 0) {
        let bestRoute = results.routes[0];
        let bestScore = Infinity;

        results.routes.forEach((route: google.maps.DirectionsRoute) => {
          const leg = route.legs?.[0];
          if (!leg) return;

          // Base score starts with duration
          const durationValue = leg.duration?.value ?? Infinity;
          let score = durationValue;

          // Add distance factor (penalize unnecessarily long routes)
          const distanceValue = leg.distance?.value ?? 0;
          const directDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
            leg.start_location,
            leg.end_location
          );
          const detourFactor = distanceValue / directDistance;
          score *= detourFactor;

          // Consider traffic conditions for driving
          if (selectedMode === 'DRIVING' && leg.duration_in_traffic?.value) {
            const trafficFactor = leg.duration_in_traffic.value / durationValue;
            score *= trafficFactor;
          }

          // Penalize routes with many steps (turns/complexity)
          if (leg.steps) {
            const complexityPenalty = leg.steps.length * 30; // 30 seconds per turn
            score += complexityPenalty;
          }

          // Transit-specific scoring
          if (selectedMode === 'TRANSIT' && leg.steps) {
            const transitSteps = leg.steps.filter(
              (step: google.maps.DirectionsStep) => step.travel_mode === window.google.maps.TravelMode.TRANSIT
            );
            // Heavier penalty for transfers (15 min per transfer)
            score += (transitSteps.length - 1) * 900;
          }

          if (score < bestScore) {
            bestScore = score;
            bestRoute = route;
          }
        });

        // Create a new DirectionsResult with only the best route
        const optimizedResult: google.maps.DirectionsResult = {
          routes: [bestRoute],
          request: request
        };
        
        setDirectionsResponse(optimizedResult);
        
        const leg = bestRoute.legs?.[0];
        if (leg) {
          setDistance(leg.distance?.text ?? '');
          if (selectedMode === 'TRANSIT' && leg.duration_in_traffic) {
            setDuration(`${leg.duration?.text ?? ''} (with transit times)`);
          } else {
            setDuration(leg.duration?.text ?? '');
          }
          
          // Adjust map bounds
          if (map && leg.start_location && leg.end_location) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
            // Add padding for better view
            map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
          }
        }
      } else {
        throw new Error('No routes found for this mode of transport');
      }
    } catch (error) {
      console.error('Directions error:', error);
      toast.error('Unable to calculate route. Please try a different location or travel mode.');
    } finally {
      setIsCalculating(false);
    }
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    if (autocompleteInputRef.current) {
      autocompleteInputRef.current.value = '';
    }
    if (map) {
      map.setZoom(DEFAULT_ZOOM);
      map.setCenter(CHURCH_LOCATION);
    }
  };

  if (mapError) {
    return (
      <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 font-medium">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onError={handleLoadError}
      >
        <GoogleMap
          center={CHURCH_LOCATION}
          zoom={DEFAULT_ZOOM}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            ...MAP_STYLES.default,
            gestureHandling: 'cooperative',
            scrollwheel: false,
          }}
          onLoad={handleMapLoad}
        >
          <Marker
            position={CHURCH_LOCATION}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          >
            {showInfoWindow && (
              <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                <div>
                  <h3 className="font-semibold">Kalk Bay Community Church</h3>
                  <p className="text-sm">Join us for worship!</p>
                </div>
              </InfoWindow>
            )}
          </Marker>

          {userLocation && !directionsResponse && (
            <Marker
              position={userLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
            />
          )}

          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#3B82F6',
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                }
              }}
            />
          )}

          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 max-w-sm w-full">
            <Autocomplete
              onLoad={(autocomplete: google.maps.places.Autocomplete) => {
                originRef.current = autocomplete;
              }}
              options={{
                componentRestrictions: { country: 'za' },
                fields: ['geometry', 'formatted_address'],
                strictBounds: false,
                types: ['geocode', 'establishment']
              }}
            >
              <input
                ref={autocompleteInputRef}
                type="text"
                placeholder="Enter your location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Autocomplete>
          </div>

          <MapControls
            onCalculateRoute={calculateRoute}
            onClearRoute={clearRoute}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            distance={distance}
            duration={duration}
            isCalculating={isCalculating}
          />

          <ZoomControls
            onZoomIn={() => map?.setZoom((map.getZoom() || 0) + 1)}
            onZoomOut={() => map?.setZoom((map.getZoom() || 0) - 1)}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default DirectionsMap;