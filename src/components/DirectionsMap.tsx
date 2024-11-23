import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { toast } from 'sonner';
import { CHURCH_LOCATION, DEFAULT_ZOOM, MAP_STYLES } from '../config/maps';
import { MapControls } from './map/MapControls';
import { ZoomControls } from './map/ZoomControls';
import type { TravelMode } from './map/types';

const DirectionsMap = () => {
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
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results?.[0] && autocompleteInputRef.current) {
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
    const directionsService = new google.maps.DirectionsService();

    try {
      const results = await directionsService.route({
        origin: place.geometry.location,
        destination: CHURCH_LOCATION,
        travelMode: google.maps.TravelMode[selectedMode],
        optimizeWaypoints: true,
        provideRouteAlternatives: false,
        avoidHighways: false,
        avoidTolls: false,
      });

      if (results.status === 'OK') {
        setDirectionsResponse(results);
        const leg = results.routes[0].legs[0];
        if (leg) {
          setDistance(leg.distance?.text || '');
          setDuration(leg.duration?.text || '');
          
          // Adjust map bounds to fit the route
          if (map && leg.start_location && leg.end_location) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
            map.fitBounds(bounds);
          }
        }
      } else {
        throw new Error('Failed to calculate route');
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

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['places']}
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
          onLoad={map => setMap(map)}
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
              onLoad={autocomplete => {
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