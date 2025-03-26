


import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Marker icons
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
const LocationMarker = ({ location }) => {
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

const OpenStreetComponent = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const defaultPosition = [12.74334, 75.50432]; // Default map center

  useEffect(() => {
    axios.get("https://atozmap.com/places")
      .then((response) => setPlaces(response.data))
      .catch(() => setErrorMsg("Failed to load places data."));
  }, []);

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
        () => {
          setErrorMsg("Unable to retrieve your location. Check permissions.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setErrorMsg("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={findMyLocation} disabled={isLoading}>
        {isLoading ? "Locating..." : "Find My Location"}
      </button>
      {errorMsg && <p style={styles.error}>{errorMsg}</p>}

      {/* ✅ Full-Screen Map */}
      <div style={styles.mapContainer}>
        <MapContainer
          center={location ? [location.latitude, location.longitude] : defaultPosition}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker location={location} />

          {/* Render places from API */}
          {places.map((place, index) => (
            <Marker key={index} position={[place.lat, place.lng]} icon={blueIcon}>
              <Popup>
                <h3>{place.name}</h3>
                <p>{place.type}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// ✅ Global styles to ensure full-screen map
const styles = {
  container: {
    width: "100vw",
    height: "100dvh", // Ensures fullscreen behavior on mobile
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    top: 0,
    left: 0,
  },
  button: {
    position: "absolute",
    top: "10px",
    left: "90%",
    transform: "translateX(-50%)",
    padding: "10px 10px 10px 10px",
    fontSize: "14px",
    backgroundColor: "#4dabf7",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    zIndex: 1000,
  },
  error: {
    position: "absolute",
    top: "50px",
    color: "red",
    fontSize: "14px",
    zIndex: 1000,
  },
  mapContainer: {
    width: "100vw",
    height: "100dvh", // Ensures full-screen map on mobile and desktop
    position: "absolute",
    top: 0,
    left: 0,
  },
};

export default OpenStreetComponent;
