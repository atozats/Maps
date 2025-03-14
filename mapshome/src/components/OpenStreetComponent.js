import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Marker iconssss
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to center map on user's location
const LocationMarker = ({ location, setLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 15);
    }
  }, [location, map]);

  return location ? (
    <Marker position={[location.latitude, location.longitude]} icon={redIcon}>
      <Popup>Your Location 📍</Popup>
    </Marker>
  ) : null;
};

// Component to control the map's zoom with a single button
const ZoomController = ({ zoomLevel, setZoomLevel }) => {
  const map = useMap();
  const [zoomIn, setZoomIn] = useState(true);
  
  // const handleZoomToggle = () => {
  //   if (zoomIn) {
  //     map.setZoom(map.getZoom() + 1);
  //   } else {
  //     map.setZoom(map.getZoom() - 1);
  //   }
  //   setZoomLevel(map.getZoom());
  //   setZoomIn(!zoomIn);
  // };
  
  return (
    <div style={styles.zoomControls}>
      {/* <button
        style={styles.zoomButton}
        onClick={handleZoomToggle}
        aria-label={zoomIn ? "Zoom In" : "Zoom Out"}
      >
        {zoomIn ? "+" : "−"}
      </button> */}
    </div>
  );
};

const OpenStreetComponent = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch places data from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/places")
      .then((response) => {
        setPlaces(response.data);
      })
      .catch((error) => {
        console.error("Error fetching places:", error);
        setErrorMsg("Failed to load places data. Please try again later.");
      });
  }, []);

  // Function to get user's current location
  const findMyLocation = () => {
    setIsLoading(true);
    setErrorMsg("");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setErrorMsg("Unable to retrieve your location. Please check your browser permissions.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setErrorMsg("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  // Custom map component to track zoom level
  const MapEvents = () => {
    const map = useMapEvents({
      zoomend: () => {
        setZoomLevel(map.getZoom());
      },
    });
    return null;
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter places based on zoom level
  useEffect(() => {
    const filtered = places.filter((place) => zoomLevel >= place.zoom);
    setFilteredPlaces(filtered);
  }, [zoomLevel, places]);

  // Default coordinates (center of map when no location is available)
  const defaultPosition = [12.74334, 75.50432];

  return (
    <div style={styles.container}>
      {/* Menu button - only shows when sidebar is closed */}
      {!isSidebarOpen && (
        <button 
          style={styles.menuButton} 
          onClick={toggleSidebar}
          aria-label="Open Menu"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h1 style={styles.title}>Interactive Map</h1>
            <button 
              style={styles.closeButton} 
              onClick={toggleSidebar}
              aria-label="Close Menu"
            >
              ✕
            </button>
          </div>
          
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>Location Info</h2>
            {location ? (
              <div style={styles.locationInfo}>
                <p><strong>Latitude:</strong> {location.latitude.toFixed(6)}</p>
                <p><strong>Longitude:</strong> {location.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <p style={styles.message}>No location data available</p>
            )}
            
            <button 
              style={styles.button} 
              onClick={findMyLocation}
              disabled={isLoading}
            >
              {isLoading ? "Locating..." : "Find My Location"}
            </button>
            
            {errorMsg && <p style={styles.errorMessage}>{errorMsg}</p>}
          </div>
          
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>Map Details</h2>
            <p><strong>Zoom Level:</strong> {zoomLevel}</p>
            <p><strong>Places Visible:</strong> {filteredPlaces.length}</p>
          </div>
          
          <div style={styles.legend}>
            <h2 style={styles.sectionTitle}>Legend</h2>
            <div style={styles.legendItem}>
              <div style={styles.redDot}></div>
              <span>Your Location</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.blueDot}></div>
              <span>Points of Interest</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.mapContainer}>
        <MapContainer
          center={location ? [location.latitude, location.longitude] : defaultPosition}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />

          {/* User's current location with auto-centering */}
          <LocationMarker location={location} setLocation={setLocation} />
          
          {/* Single zoom control button */}
          <ZoomController zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />

          {/* Filtered places based on zoom level */}
          {filteredPlaces.map((place, index) => (
            <Marker key={index} position={[place.lat, place.lng]} icon={blueIcon}>
              <Popup>
                <div style={styles.popupContent}>
                  <h3>{place.name}</h3>
                  <p><strong>Type:</strong> {place.type}</p>
                  {place.description && <p>{place.description}</p>}
                </div>
              </Popup>
              <Tooltip permanent direction="top">
                {place.name}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#121212",
    color: "#f0f0f0",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
  },
  sidebar: {
    width: "300px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1e1e1e",
    borderRight: "1px solid #333",
    overflow: "auto",
    zIndex: 1000,
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    color: "#fff",
    margin: 0,
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    transition: "background-color 0.2s",
  },
  menuButton: {
    position: "absolute",
    top: "10px",
    left: "10px",
    zIndex: 1000,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    width: "40px",
    height: "40px",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
  },
  panel: {
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#4dabf7",
    fontWeight: "500",
  },
  locationInfo: {
    marginBottom: "15px",
  },
  button: {
    backgroundColor: "#4dabf7",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 15px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "100%",
    fontWeight: "bold",
  },
  message: {
    fontStyle: "italic",
    color: "#aaa",
    marginBottom: "15px",
  },
  errorMessage: {
    color: "#ff6b6b",
    fontSize: "14px",
    marginTop: "10px",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  legend: {
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  redDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#ff4d4f",
    marginRight: "8px",
  },
  blueDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#1890ff",
    marginRight: "8px",
  },
  popupContent: {
    padding: "5px",
  },
  zoomControls: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
  },
  zoomButton: {
    width: "40px",
    height: "40px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "22px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
  }
};

export default OpenStreetComponent;