import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer'; // Import Nodemailer
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();
const PORT = 5000;

// Enable CORS and JSON middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.send('Server is running');
});


console.log("🔍 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔍 EMAIL_PASS Loaded:", process.env.EMAIL_PASS ? "✅ Yes" : "❌ No");
// --------------------
// 1️⃣ Serve Local Places Data
// --------------------

const placesFilePath = path.join(__dirname, 'phase_6_Ayanagar_delhi_india_places.json');

app.get('/places', (req, res) => {
  try {
    const placesFilePath = path.join(__dirname, '../server/phase 6_Ayanagar_delhi_india_places.json');
    
    if (!fs.existsSync(placesFilePath)) {
      console.warn(`File not found: ${placesFilePath}`);
      
      // Return empty places array as fallback
      return res.json({ 
        places: [],
        notice: "Places file not found. This is a fallback response."
      });
      
      // Alternatively, you could redirect to another endpoint or return a specific error
      // return res.status(404).json({ error: "Places data file not found" });
    }
    
    const placesData = JSON.parse(fs.readFileSync(placesFilePath, 'utf-8'));
    res.json(placesData);
  } catch (error) {
    console.error("Error reading places file:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// --------------------
// 2️⃣ Fetch Countries & States Data from Local Files
// --------------------

const PROJECT_ROOT = path.join(__dirname, '..');
const COUNTRIES_STATES_PATH = path.join(PROJECT_ROOT, 'mapshome/public/countriesandstates.json');
const COUNTRY_DETAILS_PATH = path.join(PROJECT_ROOT, 'mapshome/public/allcountriesdetails.json');

function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

function fetchLocalData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: File does not exist: ${path.relative(PROJECT_ROOT, filePath)}`);
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading data from ${path.relative(PROJECT_ROOT, filePath)}:`, error.message);
    return null;
  }
}

// Function to calculate zoom level (now called `zoom`)
function calculateZoom(country) {
  if (!country || (!country.area && !country.population)) {
    return 4;
  }

  let zoom;
  
  if (country.area) {
    if (country.area > 7000000) zoom = 3;
    else if (country.area > 2000000) zoom = 3.5;
    else if (country.area > 1000000) zoom = 4;
    else if (country.area > 500000) zoom = 4.5;
    else if (country.area > 300000) zoom = 5;
    else if (country.area > 100000) zoom = 5.5;
    else if (country.area > 50000) zoom = 6;
    else if (country.area > 20000) zoom = 6.5;
    else if (country.area > 5000) zoom = 7;
    else if (country.area > 1000) zoom = 7.5;
    else zoom = 8;
  } else if (country.population) {
    if (country.population > 100000000) zoom = 3.5;
    else if (country.population > 50000000) zoom = 4;
    else if (country.population > 20000000) zoom = 4.5;
    else if (country.population > 10000000) zoom = 5;
    else if (country.population > 5000000) zoom = 5.5;
    else if (country.population > 1000000) zoom = 6;
    else if (country.population > 500000) zoom = 6.5;
    else if (country.population > 100000) zoom = 7;
    else zoom = 7.5;
  } else {
    zoom = 4;
  }

  return Math.max(3, Math.round(zoom * 10) / 10);
}

// Generate World Data with Zoom Property
function generateWorldData() {
  try {
    console.log("🔹 Generating world data with zoom property...");

    const countryStateData = fetchLocalData(COUNTRIES_STATES_PATH);
    const countryDetails = fetchLocalData(COUNTRY_DETAILS_PATH);

    if (!countryStateData || !countryDetails) {
      console.warn("⚠️ Warning: Could not read all required data files.");
      return;
    }

    const countryGeoMap = {};
    countryDetails.forEach(country => {
      if (country.name && country.name.common && country.latlng) {
        countryGeoMap[country.name.common] = {
          latitude: country.latlng[0],
          longitude: country.latlng[1],
          area: country.area || 0,
          population: country.population || 0,
          region: country.region || '',
          subregion: country.subregion || ''
        };
      }
    });

    const jsonFilePath = path.join(PROJECT_ROOT, 'mapshome/public/worldcountriesstates.json');
    ensureDirectoryExists(jsonFilePath);

    const worldData = {
      countries: countryStateData.data.map(country => {
        const geoInfo = countryGeoMap[country.name] || {};

        return {
          name: country.name,
          code: country.iso2,
          latitude: geoInfo.latitude || null,
          longitude: geoInfo.longitude || null,
          area: geoInfo.area || null,
          population: geoInfo.population || null,
          region: geoInfo.region || null,
          subregion: geoInfo.subregion || null,
          zoom: calculateZoom({
            name: country.name,
            area: geoInfo.area,
            population: geoInfo.population,
            region: geoInfo.region
          }),
          states: country.states.map(state => ({
            name: state.name,
            code: state.state_code,
            latitude: null,
            longitude: null,
            zoom: geoInfo.area
              ? (geoInfo.area > 1000000 ? 6
                : geoInfo.area > 500000 ? 6.5
                  : geoInfo.area > 100000 ? 7
                    : 7.5)
              : 7
          })) || []
        };
      })
    };

    fs.writeFileSync(jsonFilePath, JSON.stringify(worldData, null, 2));
    console.log("✅ World data generated successfully with zoom property!");

    return worldData;
  } catch (error) {
    console.error("❌ Error generating world data:", error.message);
    return null;
  }
}

// Generate World Data on Startup
let worldData = generateWorldData();

// API to serve the world countries & states JSON
app.get('/worldcountriesstates.json', (req, res) => {
  try {
    const jsonFilePath = path.join(PROJECT_ROOT, 'mapshome/public/worldcountriesstates.json');

    if (fs.existsSync(jsonFilePath)) {
      const existingData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
      if (!existingData.countries[0].hasOwnProperty('zoom')) {
        console.log("⚠️ Data lacks zoom property. Regenerating...");
        worldData = generateWorldData();
      }
      res.json(worldData);
    } else {
      if (!worldData) worldData = generateWorldData();
      if (worldData) res.json(worldData);
      else res.status(500).json({ error: "Failed to generate world data" });
    }
  } catch (error) {
    console.error("Error serving world data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// --------------------
// 3️⃣ Feedback API - Send Emails
// --------------------
// Nodemailer configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: Missing email credentials in .env file.");
  process.exit(1);
}

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: 'mail.atozas.com', // Change this to your email provider's SMTP host
  port: 587, // Use 465 for SSL, or 587 for TLS (recommended)
  secure: false, // Set to 'true' for port 465, 'false' for port 587
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
  tls: {
    rejectUnauthorized: false, // Helps prevent SSL certificate issues
  },
});


// Feedback API
app.post('/feedback', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'info.atozmap@atozas.com',
    subject: `New Feedback from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Feedback sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});



// Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`✅ World countries and states data available at: http://localhost:${PORT}/worldcountriesstates.json`);
});
