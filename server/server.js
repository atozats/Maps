import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer'; // Import Nodemailer
import dotenv from 'dotenv';
import connectDB from './database.js'; // Import database connection
import Feedback from './models/Feedback.js'; // Import Feedback model
import sendsms from "./sendsms.js"
import BetaUser from './models/BetaUser.js';
import jwt from 'jsonwebtoken';
import githubRoutes from './routes/githubRoutes.js';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();
const PORT = 5000;


// Connect to MongoDB
connectDB();

// Enable CORS and JSON middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.send('Server is running');
});


console.log("🔍 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔍 EMAIL_PASS Loaded:", process.env.EMAIL_PASS ? "✅ Yes" : "❌ No");


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

// Feedback API - Save to Database and Send Admin Email
app.post('/feedback', async (req, res) => {
  const { message } = req.body;  // Message is expected in the body of the request
  const token = req.headers['authorization']?.split(' ')[1];  // Extract token after 'Bearer'

  
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret
    const userId = decoded.userId; // Assuming 'userId' is part of the payload
    console.log(userId)
    // Get user details from BetaUser collection
    const user = await BetaUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save feedback to the database with userId, name, and message
    const feedback = new Feedback({
      userId: user._id,   // Store the userId (ID of the user from the JWT)
      name: user.username, // Get username from BetaUser model
      message: message,    // Use the message from the request body
    });

    await feedback.save();
    
    // Optionally, send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info.atozmap@atozas.com', // Admin email
      subject: `New Feedback from ${user.username}`,
      text: `User ID: ${user._id}\nName: ${user.username}\nMessage: ${message}`,
    };

    await transporter.sendMail(adminMailOptions);
    
    res.status(200).json({ message: 'Feedback sent successfully!' });
  } catch (error) {
    console.error('Error saving feedback or sending email:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// BetaUser API

// Generate OTP

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, phone } = req.body;
    
    // Validate input
    if (!username || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and phone number are required.' 
      });
    }
    
    // Check if phone number already exists
    const existingUser = await BetaUser.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered.' 
      });
    }
    
    // Create new user
    const newUser = new BetaUser({
      username,
      phone
    });
    
    // Generate and save OTP
    const otp = generateOtp();
    newUser.otp = otp;
    newUser.otpExpiresAt = new Date(Date.now() + 5 * 60000); // OTP expires in 5 min
    await newUser.save();
    
    // Send OTP via SMS
    console.log(`Registration OTP for ${phone}: ${otp}`);
    await sendsms(phone, otp);
    
    res.json({ 
      success: true, 
      message: 'User registered. OTP sent for verification.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again later.' 
    });
  }
});

// Request OTP (for login)
app.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await BetaUser.findOne({ phone });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number not registered.' 
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60000); // OTP expires in 5 min
    await user.save();

    console.log(`Login OTP for ${phone}: ${otp}`);
    await sendsms(phone, otp);
    
    res.json({ 
      success: true, 
      message: 'OTP sent.' 
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again later.' 
    });
  }
});

// Verify OTP (for both login and registration)
app.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, isRegistering, username } = req.body;

    const user = await BetaUser.findOne({ phone });
    if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP.' 
      });
    }

    // Generate JWT token with user info
    const token = jwt.sign(
      { 
        phone,
        username: user.username,
        userId: user._id 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    // Update user information
    user.otp = null; // Clear OTP after verification
    user.lastLogin = new Date();
    await user.save();

    res.json({ 
      success: true, 
      token,
      username: user.username 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed. Please try again later.' 
    });
  }
});

// Verify Token
app.post('/verify-token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    
    // Check if user still exists in database
    const user = await BetaUser.findOne({ phone: decoded.phone });
    if (!user) {
      return res.status(400).json({ success: false });
    }
    
    res.json({ 
      success: true,
      username: user.username
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(400).json({ success: false });
  }
});

app.use('/api', githubRoutes);
// Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`✅ World countries and states data available at: http://localhost:${PORT}/worldcountriesstates.json`);
});