import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Smart Study Group Finder</h1>
        <h2>Find your perfect study partners based on courses, learning styles, and more</h2>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          <Link to="/login" className="btn btn-outline-secondary btn-lg">Login</Link>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Matching</h3>
            <p>Our intelligent algorithm connects you with compatible study partners based on multiple factors.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Course Management</h3>
            <p>Easily manage your courses and find peers in the same classes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Study Groups</h3>
            <p>Create or join study groups for focused collaboration on specific courses.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Learning Styles</h3>
            <p>Find partners with compatible learning styles for more effective studying.</p>
          </div>
        </div>
      </div>
      
      <div className="how-it-works">
        <h2>How It Works</h2>
        <ol className="steps-list">
          <li>
            <span className="step-number">1</span>
            <div className="step-content">
              <h3>Create your profile</h3>
              <p>Sign up and add your courses, major, year, and learning style preferences.</p>
            </div>
          </li>
          <li>
            <span className="step-number">2</span>
            <div className="step-content">
              <h3>Find matches</h3>
              <p>Our algorithm suggests potential study partners based on compatibility.</p>
            </div>
          </li>
          <li>
            <span className="step-number">3</span>
            <div className="step-content">
              <h3>Join or create groups</h3>
              <p>Connect with your matches and form effective study groups.</p>
            </div>
          </li>
          <li>
            <span className="step-number">4</span>
            <div className="step-content">
              <h3>Succeed together</h3>
              <p>Improve your academic performance through collaborative learning.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Home;