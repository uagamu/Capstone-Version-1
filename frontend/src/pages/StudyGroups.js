import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [courses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    course_id: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all study groups
        const groupsResponse = await axios.get('http://localhost:5000/api/groups', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch user's courses for dropdown
        const coursesResponse = await axios.get('http://localhost:5000/api/user/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setGroups(groupsResponse.data.groups || []);
        setUserCourses(coursesResponse.data.courses || []);
        
        // Identify user's groups (this logic might need to be adjusted based on your API)
        // In a real application, you would have a better way to track which groups the user belongs to
        setUserGroups(groupsResponse.data.groups.filter(group => group.is_member) || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to load study groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/groups', 
        newGroup,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh the groups list
      const groupsResponse = await axios.get('http://localhost:5000/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setGroups(groupsResponse.data.groups || []);
      setUserGroups([...userGroups, response.data.group]);
      setNewGroup({
        name: '',
        description: '',
        course_id: ''
      });
      setShowCreateForm(false);
      setSuccess('Study group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create study group: ' + (error.response?.data?.message || ''));
    }
  };

  const handleJoinGroup = async (groupId) => {
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/groups/${groupId}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh the groups list
      const groupsResponse = await axios.get('http://localhost:5000/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setGroups(groupsResponse.data.groups || []);
      const joinedGroup = groups.find(g => g.id === groupId);
      if (joinedGroup) {
        setUserGroups([...userGroups, joinedGroup]);
      }
      setSuccess('Joined study group successfully!');
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join study group: ' + (error.response?.data?.message || ''));
    }
  };

  const handleLeaveGroup = async (groupId) => {
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/groups/${groupId}/leave`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setUserGroups(userGroups.filter(group => group.id !== groupId));
      setSuccess('Left study group successfully!');
    } catch (error) {
      console.error('Error leaving group:', error);
      setError('Failed to leave study group: ' + (error.response?.data?.message || ''));
    }
  };

  const handleInputChange = (e) => {
    setNewGroup({
      ...newGroup,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading study groups...</div>;
  }

  return (
    <div className="groups-container">
      <h1>Study Groups</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="groups-section">
        <div className="section-header">
          <h2>Your Study Groups</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Group'}
          </button>
        </div>
        
        {showCreateForm && (
          <div className="create-group-form">
            <h3>Create a New Study Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label htmlFor="name">Group Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newGroup.name}
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
                  value={newGroup.description}
                  onChange={handleInputChange}
                  className="form-control"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="course_id">Course</label>
                <select
                  id="course_id"
                  name="course_id"
                  value={newGroup.course_id}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">Select a Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-success">Create Group</button>
            </form>
          </div>
        )}
        
        <div className="cards-container">
          {userGroups.length > 0 ? (
            userGroups.map(group => (
              <div className="card" key={group.id}>
                <div className="card-body">
                  <h3 className="card-title">{group.name}</h3>
                  {group.description && (
                    <p className="card-text">{group.description}</p>
                  )}
                  <p>
                    <strong>Course:</strong> {
                      courses.find(c => c.id === group.course_id)?.course_code || 'Unknown'
                    }
                  </p>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleLeaveGroup(group.id)}
                  >
                    Leave Group
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>You haven't joined any study groups yet.</p>
          )}
        </div>
      </div>
      
      <div className="groups-section">
        <h2>Available Study Groups</h2>
        <div className="cards-container">
          {groups.length > 0 ? (
            groups
              .filter(group => !userGroups.some(ug => ug.id === group.id))
              .map(group => (
                <div className="card" key={group.id}>
                  <div className="card-body">
                    <h3 className="card-title">{group.name}</h3>
                    {group.description && (
                      <p className="card-text">{group.description}</p>
                    )}
                    <p>
                      <strong>Course:</strong> {
                        courses.find(c => c.id === group.course_id)?.course_code || 'Unknown'
                      }
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      Join Group
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p>No other study groups available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;