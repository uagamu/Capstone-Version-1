import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const Dashboard = () => {
  const [userCourses, setUserCourses] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const idToken = await auth.currentUser.getIdToken();
        
        // Fetch user's courses
        const coursesResponse = await axios.get('http://localhost:5000/api/user/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch study groups (this is a placeholder - adjust to match your API)
        const groupsResponse = await axios.get('http://localhost:5000/api/groups', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUserCourses(coursesResponse.data.courses || []);
        setUserGroups(groupsResponse.data.groups || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load your data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [auth.currentUser]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Your Dashboard</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Courses</h2>
          <Link to="/courses" className="btn btn-primary">Manage Courses</Link>
        </div>
        <div className="cards-container">
          {userCourses.length > 0 ? (
            userCourses.map(course => (
              <div className="card" key={course.id}>
                <div className="card-body">
                  <h3 className="card-title">{course.course_code}</h3>
                  <h4>{course.title}</h4>
                  {course.description && (
                    <p className="card-text">{course.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>You haven't added any courses yet. Add courses to find study matches!</p>
          )}
        </div>
      </div>
      
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Study Groups</h2>
          <Link to="/groups" className="btn btn-primary">View All Groups</Link>
        </div>
        <div className="cards-container">
          {userGroups.length > 0 ? (
            userGroups.map(group => (
              <div className="card" key={group.id}>
                <div className="card-body">
                  <h3 className="card-title">{group.name}</h3>
                  {group.description && (
                    <p className="card-text">{group.description}</p>
                  )}
                  <p>Course: {group.course_id}</p>
                </div>
              </div>
            ))
          ) : (
            <p>You're not in any study groups yet. Join or create a group!</p>
          )}
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/matching" className="btn btn-success btn-lg">
          Find Study Partners
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;