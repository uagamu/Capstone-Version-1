import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCourse, setNewCourse] = useState({ course_code: '', title: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all available courses
        const allCoursesResponse = await axios.get('http://localhost:5000/api/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch user's enrolled courses
        const userCoursesResponse = await axios.get('http://localhost:5000/api/user/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCourses(allCoursesResponse.data.courses || []);
        setUserCourses(userCoursesResponse.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleAddCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5000/api/user/courses', 
        { course_id: courseId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh user's courses
      const userCoursesResponse = await axios.get('http://localhost:5000/api/user/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserCourses(userCoursesResponse.data.courses || []);
    } catch (error) {
      console.error('Error adding course:', error);
      setError('Failed to add course. ' + (error.response?.data?.message || ''));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5000/api/courses', 
        newCourse,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh all courses
      const allCoursesResponse = await axios.get('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCourses(allCoursesResponse.data.courses || []);
      setNewCourse({ course_code: '', title: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Failed to create course. ' + (error.response?.data?.message || ''));
    }
  };

  const handleInputChange = (e) => {
    setNewCourse({
      ...newCourse,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      <h1>Manage Courses</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="courses-section">
        <h2>Your Enrolled Courses</h2>
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
            <p>You haven't enrolled in any courses yet.</p>
          )}
        </div>
      </div>
      
      <div className="courses-section">
        <div className="section-header">
          <h2>Available Courses</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Course'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="add-course-form">
            <h3>Create New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label htmlFor="course_code">Course Code</label>
                <input
                  type="text"
                  id="course_code"
                  name="course_code"
                  value={newCourse.course_code}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newCourse.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  className="form-control"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-success">Create Course</button>
            </form>
          </div>
        )}
        
        <div className="cards-container">
          {courses.length > 0 ? (
            courses
              .filter(course => !userCourses.some(uc => uc.id === course.id))
              .map(course => (
                <div className="card" key={course.id}>
                  <div className="card-body">
                    <h3 className="card-title">{course.course_code}</h3>
                    <h4>{course.title}</h4>
                    {course.description && (
                      <p className="card-text">{course.description}</p>
                    )}
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAddCourse(course.id)}
                    >
                      Add to My Courses
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p>No courses are available. Create a new course!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;