
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapBoxComponent = () => {
  const mapContainerRef = useRef(null);
  const pickUpInputRef = useRef(null);
  const dropOffInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [dropOffResults, setDropOffResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showDropOffDropdown, setShowDropOffDropdown] = useState(false);
  const searchDropdownRef = useRef(null);
  const dropOffDropdownRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropOffSearching, setIsDropOffSearching] = useState(false);

  useEffect(() => {
    // Initialize map with token from environment variable
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
    
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 1
    });

    setMap(mapInstance);

    // Add zoom and rotation controls
    mapInstance.addControl(new mapboxgl.NavigationControl());

    // Function to find user's location
    const findMyLocation = () => {
      const findLocationButton = document.getElementById('findLocationButton');
      
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }

      findLocationButton.textContent = 'Locating...';
      findLocationButton.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          mapInstance.flyTo({
            center: [longitude, latitude],
            zoom: 14
          });

          new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML('<b>You are here!</b>'))
            .addTo(mapInstance);

          if (pickUpInputRef.current) {
            pickUpInputRef.current.value = `${longitude},${latitude}`; // Set current location as starting point
          }

          findLocationButton.textContent = 'Find My Location';
          findLocationButton.disabled = false;
        },
        (error) => {
          alert('Unable to retrieve your location.');
          console.error(error);
          findLocationButton.textContent = 'Find My Location';
          findLocationButton.disabled = false;
        }
      );
    };

    // Function to handle search input changes
    const handleSearchInputChange = (e) => {
      const searchValue = e.target.value.trim();
      
      if (searchValue.length < 3) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setIsSearching(true);
      
      // Fetch search results from Mapbox Geocoding API
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchValue)}.json?access_token=${mapboxgl.accessToken}&limit=5`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            setSearchResults(data.features);
            setShowSearchDropdown(true);
          } else {
            setSearchResults([]);
            setShowSearchDropdown(false);
          }
          setIsSearching(false);
        })
        .catch(error => {
          console.error('Error searching for places:', error);
          setSearchResults([]);
          setShowSearchDropdown(false);
          setIsSearching(false);
        });
    };

    // Function to handle drop-off input changes
    const handleDropOffInputChange = (e) => {
      const dropOffValue = e.target.value.trim();
      
      if (dropOffValue.length < 3) {
        setDropOffResults([]);
        setShowDropOffDropdown(false);
        return;
      }

      setIsDropOffSearching(true);
      
      // Fetch search results from Mapbox Geocoding API
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropOffValue)}.json?access_token=${mapboxgl.accessToken}&limit=5`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            setDropOffResults(data.features);
            setShowDropOffDropdown(true);
          } else {
            setDropOffResults([]);
            setShowDropOffDropdown(false);
          }
          setIsDropOffSearching(false);
        })
        .catch(error => {
          console.error('Error searching for places:', error);
          setDropOffResults([]);
          setShowDropOffDropdown(false);
          setIsDropOffSearching(false);
        });
    };

    // Function to search for a place (when clicking the search button)
    const searchPlace = () => {
      const searchValue = searchInputRef.current.value;
      
      if (!searchValue) {
        alert('Please enter a place to search');
        return;
      }

      const searchButton = document.getElementById('searchButton');
      searchButton.textContent = 'Searching...';
      searchButton.disabled = true;

      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchValue)}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const place = data.features[0];
            const [longitude, latitude] = place.center;
            
            // Update search input with selected place name
            if (searchInputRef.current) {
              searchInputRef.current.value = place.place_name;
            }
            
            // Also set the pickup location
            if (pickUpInputRef.current) {
              pickUpInputRef.current.value = `${longitude},${latitude}`;
            }
            
            mapInstance.flyTo({
              center: [longitude, latitude],
              zoom: 14
            });

            new mapboxgl.Marker({ color: '#3498db' })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML(`<b>${place.place_name}</b>`))
              .addTo(mapInstance);
          } else {
            alert('No results found for this search term.');
          }
          
          searchButton.textContent = 'Search';
          searchButton.disabled = false;
        })
        .catch(error => {
          console.error('Error searching for place:', error);
          alert('An error occurred during the search.');
          searchButton.textContent = 'Search';
          searchButton.disabled = false;
        });
    };

    // Function to show route between pick-up and drop-off locations
    const showRoute = async () => {
      const pickUpLocation = pickUpInputRef.current.value;
      const dropOffLocation = dropOffInputRef.current.value;
      
      if (!pickUpLocation || !dropOffLocation) {
        alert('Please enter both locations');
        return;
      }

      try {
        const query = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickUpLocation)}.json?access_token=${mapboxgl.accessToken}`;
        const query2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropOffLocation)}.json?access_token=${mapboxgl.accessToken}`;

        const res1 = await fetch(query);
        const res2 = await fetch(query2);

        const data1 = await res1.json();
        const data2 = await res2.json();

        if (data1.features.length === 0 || data2.features.length === 0) {
          alert('Invalid locations, please try again.');
          return;
        }

        const pickUpCoords = data1.features[0].center;
        const dropOffCoords = data2.features[0].center;

        const routeQuery = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickUpCoords.join(',')};${dropOffCoords.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
        
        const routeResponse = await fetch(routeQuery);
        const routeData = await routeResponse.json();

        if (routeData.routes && routeData.routes.length) {
          const route = {
            type: 'Feature',
            geometry: routeData.routes[0].geometry
          };

          // Add start and end point markers
          new mapboxgl.Marker({ color: '#00FF00' })
            .setLngLat(pickUpCoords)
            .setPopup(new mapboxgl.Popup().setHTML('<b>Starting Point</b>'))
            .addTo(mapInstance);

          new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat(dropOffCoords)
            .setPopup(new mapboxgl.Popup().setHTML('<b>Destination</b>'))
            .addTo(mapInstance);

          // Fit the map to the route
          const bounds = new mapboxgl.LngLatBounds();
          route.geometry.coordinates.forEach(coord => bounds.extend(coord));
          mapInstance.fitBounds(bounds, { padding: 50 });

          if (mapInstance.getSource('route')) {
            mapInstance.getSource('route').setData(route);
          } else {
            mapInstance.addSource('route', { type: 'geojson', data: route });
            mapInstance.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#007bff', 'line-width': 5 }
            });
          }
        } else {
          alert('Could not find a route between these locations.');
        }
      } catch (error) {
        console.error('Error calculating route:', error);
        alert('An error occurred while calculating the route.');
      }
    };

    // Click outside to close dropdowns
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      
      if (dropOffDropdownRef.current && !dropOffDropdownRef.current.contains(event.target) && 
          dropOffInputRef.current && !dropOffInputRef.current.contains(event.target)) {
        setShowDropOffDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Add event listeners after map loads
    mapInstance.on('load', () => {
      document.getElementById('routeButton').addEventListener('click', showRoute);
      document.getElementById('findLocationButton').addEventListener('click', findMyLocation);
      document.getElementById('searchButton').addEventListener('click', searchPlace);
      
      // Add event listener for search input
      if (searchInputRef.current) {
        searchInputRef.current.addEventListener('input', handleSearchInputChange);
        searchInputRef.current.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            searchPlace();
          }
        });
      }
      
      // Add event listener for drop-off input
      if (dropOffInputRef.current) {
        dropOffInputRef.current.addEventListener('input', handleDropOffInputChange);
      }
    });

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      mapInstance.remove();
    };
  }, []);

  return (
    <div className="map-container">
      <div className="controls-container" style={{ 
        margin: '10px 0', 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px' 
      }}>
        {/* Search section with dropdown */}
        <div style={{ 
          position: 'relative',
          marginBottom: '10px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%'
          }}>
            <input
              ref={searchInputRef}
              className="search-input"
              placeholder="Search for a place..."
              style={{ padding: '8px', flex: '1', marginRight: '5px' }}
            />
            <button
              id="searchButton"
              className="search-button"
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#3498db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Search
            </button>
          </div>
          
          {isSearching && (
            <div style={{ position: 'absolute', right: '80px', top: '10px' }}>
              <span>Loading...</span>
            </div>
          )}
          
          {showSearchDropdown && searchResults.length > 0 && (
            <div 
              ref={searchDropdownRef}
              className="search-results-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => {
                    if (map) {
                      const [longitude, latitude] = result.center;
                      
                      // Update search input
                      if (searchInputRef.current) {
                        searchInputRef.current.value = result.place_name;
                      }
                      
                      // Set pickup location coordinates
                      if (pickUpInputRef.current) {
                        pickUpInputRef.current.value = result.place_name;
                      }
                      
                      // Update map
                      map.flyTo({
                        center: [longitude, latitude],
                        zoom: 14
                      });
                      
                      new mapboxgl.Marker({ color: '#3498db' })
                        .setLngLat([longitude, latitude])
                        .setPopup(new mapboxgl.Popup().setHTML(`<b>${result.place_name}</b>`))
                        .addTo(map);
                      
                      setShowSearchDropdown(false);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: 'bold' }}>{result.text}</div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>{result.place_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pick-up and drop-off inputs after search bar */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          marginBottom: '10px' 
        }}>
          {/* Pickup input */}
          <div style={{ 
            position: 'relative',
            flex: '1',
            minWidth: '200px',
            marginRight: '10px',
            marginBottom: '5px'
          }}>
            <input
              ref={pickUpInputRef}
              className="route-input"
              placeholder="Choose starting point..."
              style={{ 
                padding: '8px',
                width: '100%'
              }}
            />
          </div>
          
          {/* Dropoff input with dropdown */}
          <div style={{ 
            position: 'relative',
            flex: '1',
            minWidth: '200px',
            marginBottom: '5px'
          }}>
            <input
              ref={dropOffInputRef}
              className="route-input"
              placeholder="Choose destination..."
              style={{ 
                padding: '8px',
                width: '100%'
              }}
            />
            
            {isDropOffSearching && (
              <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                <span>Loading...</span>
              </div>
            )}
            
            {showDropOffDropdown && dropOffResults.length > 0 && (
              <div 
                ref={dropOffDropdownRef}
                className="dropoff-results-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {dropOffResults.map((result, index) => (
                  <div
                    key={index}
                    className="dropoff-result-item"
                    onClick={() => {
                      if (map) {
                        const [longitude, latitude] = result.center;
                        
                        // Update dropoff input
                        if (dropOffInputRef.current) {
                          dropOffInputRef.current.value = result.place_name;
                        }
                        
                        // Add marker for destination
                        new mapboxgl.Marker({ color: '#FF0000' })
                          .setLngLat([longitude, latitude])
                          .setPopup(new mapboxgl.Popup().setHTML(`<b>${result.place_name}</b>`))
                          .addTo(map);
                        
                        setShowDropOffDropdown(false);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: index < dropOffResults.length - 1 ? '1px solid #eee' : 'none'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: 'bold' }}>{result.text}</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{result.place_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons at the bottom */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <button
            id="findLocationButton"
            className="find-location-button"
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginRight: '10px',
              marginBottom: '5px'
            }}
          >
            Find My Location
          </button>
          <button
            id="routeButton"
            className="route-button"
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginBottom: '5px'
            }}
          >
            Show Route
          </button>
        </div>
      </div>
      
      {/* Map container */}
      <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default MapBoxComponent;