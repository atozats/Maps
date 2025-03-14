import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const OwnMapComponent = () => {
  const svgRef = useRef(null);
  const mapRef = useRef(null);
  const zoomRef = useRef(null);
  const countryInfoRef = useRef(null);
  const zoomLevelRef = useRef(null);
  
  const [mapData, setMapData] = useState({ countries: [], countryData: null });
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 60
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Loading map data...');
  const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 60
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load the map data only once
  useEffect(() => {
    setLoading(true);
  
    // Update status message using state instead of direct DOM manipulation
    setStatusMessage("Loading map data...");
  
    Promise.all([
      fetch("/countries-110m.json").then((res) => res.json()),
      fetch("http://localhost:5000/worldcountriesstates.json").then((res) => res.json()),
    ])
      .then(([worldData, countryData]) => {
        console.log("Backend country data loaded:", countryData);
        const countries = topojson.feature(worldData, worldData.objects.countries).features;
  
        // Map topojson country IDs to our country data for easier lookup
        const countryMap = new Map();
        if (countryData && countryData.countries) {
          countryData.countries.forEach((country) => {
            // Find matching feature in topojson data
            const feature = countries.find((f) => f.id === country.code);
            if (feature) {
              feature.properties.countryData = country;
              feature.properties.area = country.area || 0;
              feature.properties.name = country.name;
              feature.properties.zoomLevel = country.zoomLevel;
  
              // Log the country name and zoom level for debugging
              console.log(`Country: ${country.name}, Zoom Level: ${country.zoomLevel}`);
            }
            countryMap.set(country.code, country);
          });
        }
  
        setMapData({ countries, countryData, countryMap });
        setLoading(false);
        setStatusMessage("Map loaded successfully");
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setError("Failed to load map data");
        setLoading(false);
        setStatusMessage("Error loading map");
      });
  }, []);
  

  // Initialize and update the map
  useEffect(() => {
    if (!mapData.countries.length) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    svg.attr("width", width)
       .attr("height", height);

    // Create map container group
    const g = svg.append("g");
    mapRef.current = g;

    // Define map constants
    const MIN_ZOOM = 1;
    const MAX_ZOOM = 8;
    
    // Create base scale factor for proper world fit
    const baseScale = width / 6.2;
    
    // Setup base projection for the main map
    const projection = d3.geoMercator()
      .scale(baseScale)
      .translate([width / 2, height / 2]);
    
    // Calculate the width of the world in projected coordinates
    // This is important for continuous scrolling
    const worldWidth = Math.PI * 2 * baseScale;
    
    // Draw the base map
    const path = d3.geoPath().projection(projection);
    
    // Create water background
    g.append("rect")
      .attr("width", width * 3) // Make wider to cover extended area
      .attr("height", height)
      .attr("x", -width) // Position to allow for scrolling left
      .attr("fill", "#a4d1e8");
    
    // Draw countries and labels
    drawMapFeatures(g, mapData, path);

    // Setup custom zoom behavior with continuous scrolling
    const zoom = d3.zoom()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM]) // Set min/max zoom levels
      .translateExtent([[-Infinity, -height], [Infinity, height * 2]]) // Limit vertical panning
      .on("zoom", (event) => {
        // Get the current transform
        const transform = event.transform;
        
        // Apply x-transform with modulo for continuous horizontal scrolling
        const xMod = transform.x % (worldWidth * transform.k);
        
        // Apply the transform
        g.attr("transform", `translate(${xMod}, ${transform.y}) scale(${transform.k})`);
        
        // Update label visibility based on zoom level
        updateLabelVisibility(g, transform.k);
        
        // Create map copies for continuous scrolling
        updateMapCopies(svg, g, xMod, transform.k, transform.y, worldWidth, mapData, width, height);
        
        // Update zoom level state instead of DOM manipulation
        setCurrentZoomLevel(transform.k.toFixed(1));
      });

    zoomRef.current = zoom;
    svg.call(zoom);
    
    // Set initial zoom (starting view)
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(MIN_ZOOM);
    svg.call(zoom.transform, initialTransform);
    
    // Initialize label visibility for starting zoom level - all labels visible initially
    updateLabelVisibility(g, MIN_ZOOM);

  }, [mapData, dimensions]);
  
  // Function to update label visibility based on zoom level
  function updateLabelVisibility(container, zoomLevel) {
    // Make sure country labels are displayed appropriately
    container.selectAll(".country-label")
      .style("display", "block"); // Always show labels
  }

  // Function to draw map features
  function drawMapFeatures(container, mapData, path) {
    // Create a country group
    const countryGroup = container.append("g")
      .attr("class", "countries");
  
    // Draw countries
    countryGroup.selectAll("path")
      .data(mapData.countries)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", d => d.id === selectedCountry ? "#c0c0c0" : "#e8e8e8")
      .attr("stroke", d => d.id === selectedCountry ? "#666666" : "#cccccc")
      .attr("stroke-width", d => d.id === selectedCountry ? 1 : 0.5)
      .attr("data-country-id", d => d.id)
      .on("mouseover", function () {
        d3.select(this)
          .attr("fill", "#d0d0d0")
          .attr("stroke", "#999999")
          .attr("stroke-width", 1);
      })
      .on("mouseout", function (_, d) {
        d3.select(this)
          .attr("fill", d.id === selectedCountry ? "#c0c0c0" : "#e8e8e8")
          .attr("stroke", d.id === selectedCountry ? "#666666" : "#cccccc")
          .attr("stroke-width", d.id === selectedCountry ? 1 : 0.5);
      })
      .on("click", function (_, d) {
        const countryData = d.properties.countryData || mapData.countryData?.countries.find(
          country => country.code === d.id
        );
  
        if (countryData && countryData.latitude && countryData.longitude) {
          setSelectedCountry(d.id);
          zoomToCountry(container, countryData);
        }
      });
  
    // Create separate label group
    const labelGroup = container.append("g")
      .attr("class", "country-labels");
  
    // Country labels with fixed font size
    labelGroup.selectAll("text")
      .data(mapData.countries)
      .enter()
      .append("text")
      .attr("class", "country-label")
      .attr("transform", d => {
        const centroid = path.centroid(d);
        if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
          return `translate(${centroid[0]}, ${centroid[1]})`;
        }
        return null;
      })
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-family", "Arial, sans-serif")
      .style("fill", "#333")
      .style("pointer-events", "none")
      .style("text-shadow", "0px 0px 3px white, 0px 0px 3px white, 0px 0px 3px white, 0px 0px 3px white")
      .style("font-size", "5px")  // Fixed font size
      .text(d => d.properties.name || "")
      .style("display", "block"); // Labels visible by default
  }
  
  // Enhanced function to zoom to a specific country using its custom zoom level from backend
  function zoomToCountry(container, country) {
    if (!zoomRef.current || !svgRef.current || !country.latitude || !country.longitude) return;
    
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    
    // Setup a temporary projection to convert lat/lng to pixels
    const tempProjection = d3.geoMercator()
      .scale(width / 6.2)
      .translate([width / 2, height / 2]);
    
    // Calculate pixel position of the country
    const [x, y] = tempProjection([country.longitude, country.latitude]);
    
    // Use the country's custom zoom level from backend
    let zoomLevel = country.zoomLevel || 4;
    
    // Create a new transform to center on the country with its specific zoom level
    const transform = d3.zoomIdentity
      .translate(width / 2 - x * zoomLevel, height / 2 - y * zoomLevel)
      .scale(zoomLevel);
    
    // Apply the transform with a smooth transition
    svg.transition().duration(750)
      .call(zoomRef.current.transform, transform);

    // Use state instead of direct DOM manipulation
    setStatusMessage(`${country.name} - Zoom Level: ${zoomLevel}`);
  }

  // Function to update map copies for continuous scrolling
  function updateMapCopies(svg, mainMap, xTransform, kScale, yTransform, worldWidth, mapData, width, height) {
    // Remove existing copies
    svg.selectAll(".map-copy").remove();
    
    // Create copies to the left and right of the current view
    [-1, 1].forEach(offset => {
      // Calculate position for this copy
      const copyX = xTransform + (offset * worldWidth * kScale);
      
      // Only create copies that are within or close to the viewport
      if (copyX > -width * kScale && copyX < width * 2 * kScale) {
        const copyProjection = d3.geoMercator()
          .scale(width / 6.2)
          .translate([width / 2, height / 2]);
        
        const path = d3.geoPath().projection(copyProjection);
        
        // Create copy group
        const copy = svg.append("g")
          .attr("class", "map-copy")
          .attr("transform", `translate(${copyX}, ${yTransform}) scale(${kScale})`);
        
        // Draw features on the copy
        drawMapFeatures(copy, mapData, path);
        
        // Update label visibility for the copy based on current zoom level
        updateLabelVisibility(copy, kScale);
      }
    });
  }

  // Zoom control functions
  const handleZoomIn = () => {
    if (!zoomRef.current || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    
    // Create a new transform with increased scale
    const newTransform = d3.zoomIdentity
      .translate(currentTransform.x, currentTransform.y)
      .scale(currentTransform.k * 1.3); // Increase zoom by 30%
    
    svg.transition().duration(300).call(zoomRef.current.transform, newTransform);
  };

  const handleZoomOut = () => {
    if (!zoomRef.current || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    
    // Create a new transform with decreased scale
    const newTransform = d3.zoomIdentity
      .translate(currentTransform.x, currentTransform.y)
      .scale(Math.max(1, currentTransform.k / 1.3)); // Decrease zoom by 30% but don't go below 1
    
    svg.transition().duration(300).call(zoomRef.current.transform, newTransform);
  };

  const handleResetView = () => {
    if (!zoomRef.current || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1);
    
    svg.transition().duration(300).call(zoomRef.current.transform, initialTransform);
    setSelectedCountry(null);
    setStatusMessage('');
  };

  // Function to zoom to a specific country by code with its custom zoom level
  const zoomToCountryByCode = (countryCode) => {
    if (!countryCode || !mapData.countryMap) return;
    
    const country = mapData.countryMap.get(countryCode);
    
    if (country && country.latitude && country.longitude) {
      setSelectedCountry(countryCode);
      zoomToCountry(mapRef.current, country);
    }
  };

  if (loading) {
    return <div>Loading map data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
      <div style={{ padding: "10px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button 
            onClick={handleZoomIn}
            style={{ padding: "5px 10px", marginRight: "5px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Zoom In
          </button>
          <button 
            onClick={handleZoomOut}
            style={{ padding: "5px 10px", marginRight: "5px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Zoom Out
          </button>
          <button 
            onClick={handleResetView}
            style={{ padding: "5px 10px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Reset View
          </button>
          <span ref={zoomLevelRef} style={{ marginLeft: "10px", fontSize: "12px", color: "#666" }}>
            Current Zoom: {currentZoomLevel}
          </span>
        </div>
        <div ref={countryInfoRef} style={{ fontWeight: "bold", minWidth: "150px", textAlign: "center" }}>
          {statusMessage}
        </div>
        <div>
          <select 
            onChange={(e) => e.target.value && zoomToCountryByCode(e.target.value)} 
            style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ddd", minWidth: "200px" }}
            defaultValue=""
          >
            <option value="">Select a country...</option>
            {mapData.countryData && mapData.countryData.countries && 
              mapData.countryData.countries
                .filter(country => country.latitude && country.longitude)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} (Zoom: {country.zoomLevel})
                  </option>
                ))
            }
          </select>
        </div>
      </div>
      <div 
        id="mapContainer" 
        style={{ 
          width: "100%", 
          height: "calc(100vh - 60px)",
          overflow: "hidden",
          backgroundColor: "#a4d1e8"
        }}
      >
        <svg 
          ref={svgRef} 
          style={{
            width: "100%",
            height: "100%"
          }}
        ></svg>
      </div>
    </div>
  );
};

export default OwnMapComponent;