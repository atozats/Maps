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
    height: window.innerHeight - 60,
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
        height: window.innerHeight - 60,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load the map data only once
  useEffect(() => {
    setLoading(true);
    setStatusMessage('Loading map data...');

    Promise.all([
      fetch('/countries-110m.json').then((res) => res.json()),
      fetch('https://atozmap.com/worldcountriesstates.json').then((res) => res.json()),
    ])
      .then(([worldData, countryData]) => {
        const countries = topojson.feature(worldData, worldData.objects.countries).features;
        const countryMap = new Map();
        if (countryData && countryData.countries) {
          countryData.countries.forEach((country) => {
            const feature = countries.find((f) => f.id === country.code);
            if (feature) {
              feature.properties.countryData = country;
              feature.properties.area = country.area || 0;
              feature.properties.name = country.name;
              feature.properties.zoomLevel = country.zoomLevel;
            }
            countryMap.set(country.code, country);
          });
        }
        setMapData({ countries, countryData, countryMap });
        setLoading(false);
        setStatusMessage('Map loaded successfully');
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        setError('Failed to load map data');
        setLoading(false);
        setStatusMessage('Error loading map');
      });
  }, []);

  // Initialize and update the map
  useEffect(() => {
    if (!mapData.countries.length) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');
    mapRef.current = g;

    const MIN_ZOOM = 1;
    const MAX_ZOOM = 8;
    const baseScale = width / 6.2;
    const projection = d3.geoMercator().scale(baseScale).translate([width / 2, height / 2]);
    const worldWidth = Math.PI * 2 * baseScale;
    const path = d3.geoPath().projection(projection);

    g.append('rect')
      .attr('width', width * 3)
      .attr('height', height)
      .attr('x', -width)
      .attr('fill', '#a4d1e8');

    drawMapFeatures(g, mapData, path);

    const zoom = d3
      .zoom()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .translateExtent([[-Infinity, -height], [Infinity, height * 2]])
      .on('zoom', (event) => {
        const transform = event.transform;
        const xMod = transform.x % (worldWidth * transform.k);
        g.attr('transform', `translate(${xMod}, ${transform.y}) scale(${transform.k})`);
        updateLabelVisibility(g, transform.k);
        updateMapCopies(svg, g, xMod, transform.k, transform.y, worldWidth, mapData, width, height);
        setCurrentZoomLevel(transform.k.toFixed(1));
      });

    zoomRef.current = zoom;
    svg.call(zoom);
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(MIN_ZOOM);
    svg.call(zoom.transform, initialTransform);
    updateLabelVisibility(g, MIN_ZOOM);
  }, [mapData, dimensions]);

  // Function to update label visibility
  function updateLabelVisibility(container, zoomLevel) {
    container.selectAll('.country-label').style('display', 'block');
  }

  // Function to draw map features
  function drawMapFeatures(container, mapData, path) {
    const countryGroup = container.append('g').attr('class', 'countries');
    countryGroup
      .selectAll('path')
      .data(mapData.countries)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => (d.id === selectedCountry ? '#c0c0c0' : '#e8e8e8'))
      .attr('stroke', (d) => (d.id === selectedCountry ? '#666666' : '#cccccc'))
      .attr('stroke-width', (d) => (d.id === selectedCountry ? 1 : 0.5))
      .attr('data-country-id', (d) => d.id)
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#d0d0d0').attr('stroke', '#999999').attr('stroke-width', 1);
      })
      .on('mouseout', function (_, d) {
        d3.select(this)
          .attr('fill', d.id === selectedCountry ? '#c0c0c0' : '#e8e8e8')
          .attr('stroke', d.id === selectedCountry ? '#666666' : '#cccccc')
          .attr('stroke-width', d.id === selectedCountry ? 1 : 0.5);
      })
      .on('click', function (_, d) {
        const countryData = d.properties.countryData || mapData.countryData?.countries.find((country) => country.code === d.id);
        if (countryData && countryData.latitude && countryData.longitude) {
          setSelectedCountry(d.id);
          zoomToCountry(container, countryData);
        }
      });

    const labelGroup = container.append('g').attr('class', 'country-labels');
    labelGroup
      .selectAll('text')
      .data(mapData.countries)
      .enter()
      .append('text')
      .attr('class', 'country-label')
      .attr('transform', (d) => {
        const centroid = path.centroid(d);
        if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
          return `translate(${centroid[0]}, ${centroid[1]})`;
        }
        return null;
      })
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'central')
      .style('font-family', 'Arial, sans-serif')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .style('text-shadow', '0px 0px 3px white, 0px 0px 3px white, 0px 0px 3px white, 0px 0px 3px white')
      .style('font-size', '5px')
      .text((d) => d.properties.name || '')
      .style('display', 'block');
  }

  // Function to zoom to a specific country
  function zoomToCountry(container, country) {
    if (!zoomRef.current || !svgRef.current || !country.latitude || !country.longitude) return;
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    const tempProjection = d3.geoMercator().scale(width / 6.2).translate([width / 2, height / 2]);
    const [x, y] = tempProjection([country.longitude, country.latitude]);
    let zoomLevel = country.zoomLevel || 4;
    const transform = d3.zoomIdentity.translate(width / 2 - x * zoomLevel, height / 2 - y * zoomLevel).scale(zoomLevel);
    svg.transition().duration(750).call(zoomRef.current.transform, transform);
    setStatusMessage(`${country.name} - Zoom Level: ${zoomLevel}`);
  }

  // Function to update map copies for continuous scrolling
  function updateMapCopies(svg, mainMap, xTransform, kScale, yTransform, worldWidth, mapData, width, height) {
    svg.selectAll('.map-copy').remove();
    [-1, 1].forEach((offset) => {
      const copyX = xTransform + offset * worldWidth * kScale;
      if (copyX > -width * kScale && copyX < width * 2 * kScale) {
        const copyProjection = d3.geoMercator().scale(width / 6.2).translate([width / 2, height / 2]);
        const path = d3.geoPath().projection(copyProjection);
        const copy = svg.append('g').attr('class', 'map-copy').attr('transform', `translate(${copyX}, ${yTransform}) scale(${kScale})`);
        drawMapFeatures(copy, mapData, path);
        updateLabelVisibility(copy, kScale);
      }
    });
  }

  // Zoom control functions
  const handleZoomIn = () => {
    if (!zoomRef.current || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    const newTransform = d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(currentTransform.k * 1.3);
    svg.transition().duration(300).call(zoomRef.current.transform, newTransform);
  };

  const handleZoomOut = () => {
    if (!zoomRef.current || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    const newTransform = d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(Math.max(1, currentTransform.k / 1.3));
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
    <div style={styles.container}>
      <div style={styles.controlBar}>
        <div style={styles.controls}>
          <button onClick={handleZoomIn} style={styles.button}>
            Zoom In
          </button>
          <button onClick={handleZoomOut} style={styles.button}>
            Zoom Out
          </button>
          <button onClick={handleResetView} style={styles.button}>
            Reset View
          </button>
          <span ref={zoomLevelRef} style={styles.zoomLevel}>
            Current Zoom: {currentZoomLevel}
          </span>
        </div>
        <div ref={countryInfoRef} style={styles.statusMessage}>
          {statusMessage}
        </div>
        <div>
          <select onChange={(e) => e.target.value && zoomToCountryByCode(e.target.value)} style={styles.dropdown}>
            <option value="">Select a country...</option>
            {mapData.countryData &&
              mapData.countryData.countries &&
              mapData.countryData.countries
                .filter((country) => country.latitude && country.longitude)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} (Zoom: {country.zoomLevel})
                  </option>
                ))}
          </select>
        </div>
      </div>
      <div style={styles.mapContainer}>
        <svg ref={svgRef} style={styles.svg}></svg>
      </div>
    </div>
  );
};

// Responsive styles
const styles = {
  container: {
    width: '100%',
    height: '100vh',
    margin: 0,
    padding: 0,
  },
  controlBar: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    backgroundColor: '#f9f9f9',
  },
  controls: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  zoomLevel: {
    marginLeft: '10px',
    fontSize: '14px',
    color: '#666',
  },
  statusMessage: {
    fontWeight: 'bold',
    minWidth: '150px',
    textAlign: 'center',
    fontSize: '14px',
  },
  dropdown: {
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    minWidth: '200px',
    fontSize: '14px',
  },
  mapContainer: {
    width: '100%',
    height: 'calc(100vh - 60px)',
    overflow: 'hidden',
    backgroundColor: '#a4d1e8',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  '@media (max-width: 768px)': {
    controlBar: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '5px',
    },
    controls: {
      width: '100%',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      fontSize: '12px',
    },
    zoomLevel: {
      marginLeft: '0',
      marginTop: '5px',
      fontSize: '12px',
    },
    statusMessage: {
      width: '100%',
      textAlign: 'left',
      marginTop: '5px',
      fontSize: '12px',
    },
    dropdown: {
      width: '100%',
      marginTop: '5px',
      fontSize: '12px',
    },
  },
};

export default OwnMapComponent;