import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapBoxComponent from './components/MapBoxComponent';
import OpenStreetComponent from './components/OpenStreetComponent';
import OwnMapComponent from './components/OwnMapComponent';
import './assets/stylesMB.css';
import FeedbackForm from './components/FeedbackForm';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Header Section */}
      <header className="site-header">
        <div className="header-content">
          <h1 className="header-title">atozmap</h1>
          <p className="tagline">Exploring the world through beautiful cartography</p>
        </div>
        <div className="quote-container">
          <p className="inspirational-quote">
            "A map is the greatest of all epic poems. Its lines and colors show the realization of great dreams." 
          </p>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="intro-section">
        <div className="container">
          <h2 className="intro-title">Modern Mapping Solutions</h2>
          <p className="intro-text">
            Welcome to atozmap, where we demonstrate three distinct approaches to implementing interactive maps in web applications. Each map showcases unique technologies and methodologies, from open-source solutions to custom-built mapping systems.
          </p>
        </div>
      </section>

      {/* Map Showcase Section */}
      <section className="map-showcase">
        <div className="container">
          <h2 className="showcase-title">Our Map Implementations</h2>
          <div className="map-grid">
            {/* OpenStreetMap Card */}
            <div className="map-card">
              <div className="map-image openstreet-image"></div>
              <div className="map-content">
                <h3 className="map-card-title">OpenStreetMap Viewer</h3>
                <p className="map-card-text">
                  Our OpenStreetMap implementation uses freely available OpenStreetMap tile URLs to create an interactive map. We’ve enhanced it with location markers using the Google API, demonstrating how open-source mapping can be integrated with external services. This approach is cost-effective and highly customizable.
                </p>
                <Link to="/openstreet" className="map-button">Explore OpenStreetMap</Link>
              </div>
            </div>

            {/* MapBox Card */}
            <div className="map-card">
              <div className="map-image mapbox-image"></div>
              <div className="map-content">
                <h3 className="map-card-title">Map from MapBox</h3>
                <p className="map-card-text">
                  Our MapBox implementation leverages the power of MapBox tokens to create a feature-rich, customizable map. With custom styling and interactive elements, this solution is ideal for applications requiring advanced mapping capabilities and a polished user experience.
                </p>
                <Link to="/mapbox" className="map-button">Explore MapBox</Link>
              </div>
            </div>

            {/* OwnMap Card */}
            <div className="map-card">
              <div className="map-image ownmap-image"></div>
              <div className="map-content">
                <h3 className="map-card-title">Map from OwnMap</h3>
                <p className="map-card-text">
                  The most unique aspect of our project is the OwnMap implementation. Built entirely from scratch without relying on external APIs or tokens, this custom map solution uses three JSON files (<code>countriesandstates.json</code>, <code>countries-110m.json</code>, and <code>allcountriesdetails.json</code>) to render maps. This approach gives developers complete control over their cartographic creations. We are grateful for the availability of these JSON files, which have made this implementation possible.
                </p>
                <Link to="/ownmap" className="map-button">Explore OwnMap</Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Feedback and GitHub Invitation Section */}
      <section className="feedback-github-section">
        <div className="container">
          <div className="feedback-github-grid">
            {/* Feedback Box */}
            <div className="feedback-box">
              <h2 className="feedback-title">We Value Your Feedback</h2>
              <blockquote className="feedback-quote">
                "Your feedback is the compass that guides our journey to improvement."
              </blockquote>
              <p className="feedback-text">
                Help us improve by sharing your thoughts. Your insights are invaluable to us.
              </p>
              <Link to="/feedback" className="feedback-button">Give Feedback</Link>
            </div>

            {/* GitHub Invitation Box */}
            <div className="github-box">
              <h2 className="github-title">Join Our Development Journey</h2>
              <blockquote className="github-quote">
                "Great code is not just written; it's crafted with passion and collaboration."
              </blockquote>
              <p className="github-text">
                If you’re passionate about mapping, open-source development, or innovative solutions, we’d love to collaborate with you. Let’s build something extraordinary together!
              </p>
              <a href="https://github.com/atozats/Maps.git" className="github-button">Join Us on GitHub</a>
            </div>
          </div>
        </div>
      </section>


      {/* Developer Invitation Section */}
      <section className="developer-section">
        <div className="container">
          <h2 className="developer-title">Join Our Development Journey</h2>
          <p className="developer-text">
            We’re particularly excited about advancing our OwnMap implementation, pushing the boundaries of what’s possible with custom mapping solutions. Our goal is to create a truly independent mapping system that empowers developers to build maps tailored to their specific needs.
          </p>
          <blockquote className="inspirational-quote">
            "Maps are the canvas upon which we paint our understanding of the world. With technology as our brush, we can create new ways to visualize and interact with the spaces around us."
          </blockquote>
          <p className="developer-text emphasis-text">
            If you’re passionate about mapping, open-source development, or innovative solutions, we’d love to collaborate with you. Let’s build something extraordinary together!
          </p>
          <div className="cta-container">
            <a href="https://github.com/atozats/Maps.git" className="cta-button">Join Us on GitHub</a>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="site-footer">
        <div className="container">
          <p className="footer-text">&copy; 2025 atozmap. All rights reserved.</p>
          <p className="footer-text">Built with React and Node.js</p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mapbox" element={<MapBoxComponent />} />
        <Route path="/openstreet" element={<OpenStreetComponent />} />
        <Route path="/ownmap" element={<OwnMapComponent />} />
        <Route path="/feedback" element={<FeedbackForm />} /> {/* Feedback Form Route */}
      </Routes>
    </Router>
  );
};

export default App;

