// src/components/Map/MapComponent.js
import React, { useEffect, useRef, useState } from "react";
import "./MapComponent.css";

// Leaflet akan dimuat secara dinamis untuk menghindari masalah SSR
let L = null;

const MapComponent = ({
  latitude = null,
  longitude = null,
  onLocationSelect = null,
  readonly = false,
  height = "400px",
  zoom = 10,
  className = "",
  markers = [],
  centerOnMarkers = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Leaflet secara dinamis
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Import Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);

        // Import Leaflet JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        script.onload = () => {
          L = window.L;
          setIsMapReady(true);
          setIsLoading(false);
        };

        script.onerror = () => {
          console.error("Failed to load Leaflet");
          setIsLoading(false);
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
          document.head.removeChild(link);
          document.head.removeChild(script);
        };
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setIsLoading(false);
      }
    };

    if (!L && !window.L) {
      loadLeaflet();
    } else {
      L = window.L;
      setIsMapReady(true);
      setIsLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapReady || !L || !mapRef.current) return;

    // Default center: Indonesia
    let defaultLat = -2.5489;
    let defaultLng = 118.0149;
    let defaultZoom = 5;

    // If we have coordinates, use them
    if (latitude && longitude) {
      defaultLat = latitude;
      defaultLng = longitude;
      defaultZoom = zoom;
    }

    // Create map instance
    const map = L.map(mapRef.current).setView(
      [defaultLat, defaultLng],
      defaultZoom
    );
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add marker if coordinates provided
    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude], {
        draggable: !readonly,
      }).addTo(map);
      markerRef.current = marker;

      // Add popup with coordinates
      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>Lokasi Gunung</strong><br>
          Lat: ${latitude.toFixed(6)}<br>
          Lng: ${longitude.toFixed(6)}
        </div>
      `);

      // Handle marker drag if not readonly
      if (!readonly && onLocationSelect) {
        marker.on("dragend", function (e) {
          const position = e.target.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });
      }
    }

    // Handle map click if not readonly
    if (!readonly && onLocationSelect) {
      map.on("click", function (e) {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        const marker = L.marker([lat, lng], {
          draggable: true,
        }).addTo(map);
        markerRef.current = marker;

        // Add popup
        marker
          .bindPopup(
            `
          <div style="text-align: center;">
            <strong>Lokasi Terpilih</strong><br>
            Lat: ${lat.toFixed(6)}<br>
            Lng: ${lng.toFixed(6)}
          </div>
        `
          )
          .openPopup();

        // Handle marker drag
        marker.on("dragend", function (e) {
          const position = e.target.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });

        // Call callback
        onLocationSelect(lat, lng);
      });
    }

    // Add additional markers if provided
    if (markers && markers.length > 0) {
      const markerGroup = L.featureGroup();

      markers.forEach((markerData, index) => {
        if (markerData.lat && markerData.lng) {
          const marker = L.marker([markerData.lat, markerData.lng]).addTo(map);

          if (markerData.popup) {
            marker.bindPopup(markerData.popup);
          }

          markerGroup.addLayer(marker);
        }
      });

      // Center map on markers if requested
      if (centerOnMarkers && markerGroup.getLayers().length > 0) {
        map.fitBounds(markerGroup.getBounds(), { padding: [20, 20] });
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    isMapReady,
    latitude,
    longitude,
    readonly,
    onLocationSelect,
    zoom,
    markers,
    centerOnMarkers,
  ]);

  if (isLoading) {
    return (
      <div className={`map-container loading ${className}`} style={{ height }}>
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Memuat peta...</p>
        </div>
      </div>
    );
  }

  if (!isMapReady) {
    return (
      <div className={`map-container error ${className}`} style={{ height }}>
        <div className="map-error">
          <i className="bi bi-exclamation-triangle"></i>
          <p>Gagal memuat peta</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`} style={{ height }}>
      <div
        ref={mapRef}
        className="map"
        style={{ height: "100%", width: "100%" }}
      />
      {!readonly && (
        <div className="map-instructions">
          <i className="bi bi-info-circle"></i>
          <span>Klik pada peta untuk menandai lokasi gunung</span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
