import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Matching = () => {
  const [matches, setMatches] = useState([]);
  const [courses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    course_id: '',
    learning_style: ''
  });

  useEffect(() => {
    // Fetch user's courses for filter dropdown
    const fetchUserCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:5000/api/user/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUserCourses(response.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      }
    };
    
    fetchUserCourses();
  }, []);

  const handleFindMatches = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      let url = 'http://localhost:5000/api/matching/students';
      const params = {};
      
      if (filters.course_id) {
        params.course_id = filters.course_id;
      }
      
      if (filters.learning_style) {
        params.learning_style = filters.learning_style;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error finding matches:', error);
      setError('Failed to find matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="matching-container">
      <h1>Find Study Partners</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="matching-filters">
        <form onSubmit={handleFindMatches}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course_id">Filter by Course</label>
              <select
                id="course_id"
                name="course_id"
                value={filters.course_id}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="learning_style">Filter by Learning Style</label>
              <select
                id="learning_style"
                name="learning_style"
                value={filters.learning_style}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="">Any Learning Style</option>
                <option value="Visual">Visual</option>
                <option value="Auditory">Auditory</option>
                <option value="Reading/Writing">Reading/Writing</option>
                <option value="Kinesthetic">Kinesthetic</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Finding Matches...' : 'Find Matches'}
          </button>
        </form>
      </div>
      
      <div className="matching-results">
        <h2>Potential Study Partners</h2>
        
        {loading ? (
          <div className="loading">Finding matches...</div>
        ) : matches.length > 0 ? (
          <div className="cards-container">
            {matches.map((match, index) => (
              <div className="card match-card" key={index}>
                <div className="card-body">
                  <h3 className="card-title">{match.user.name}</h3>
                  <div className="match-score">
                    <span className="score-label">Match Score:</span>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${match.match_score}%` }}
                      >
                        {match.match_score}%
                      </div>
                    </div>
                  </div>
                  <div className="match-details">
                    <p><strong>Major:</strong> {match.user.major || 'Not specified'}</p>
                    <p><strong>Year:</strong> {match.user.year || 'Not specified'}</p>
                    <p><strong>Learning Style:</strong> {match.user.learning_style || 'Not specified'}</p>
                    <p><strong>Common Courses:</strong> {match.common_courses}</p>
                    
                    {match.common_course_details && match.common_course_details.length > 0 && (
                      <div className="common-courses">
                        <p><strong>Courses in Common:</strong></p>
                        <ul>
                          {match.common_course_details.map(course => (
                            <li key={course.id}>{course.course_code} - {course.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No matches found. Try adjusting your filters or adding more courses to your profile.</p>
        )}
      </div>
    </div>
  );
};

export default Matching;