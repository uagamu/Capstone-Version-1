import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add the token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and it's not a retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get a new Firebase ID token
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          const newIdToken = await currentUser.getIdToken(true);
          
          // Try to refresh the backend token
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
            headers: {
              'Authorization': `Bearer ${newIdToken}`
            }
          });
          
          // If we got a new token, save it and retry the original request
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // If token refresh fails, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => {
    return apiClient.post('/api/auth/register', userData);
  },
  
  login: (credentials) => {
    return apiClient.post('/api/auth/login', credentials);
  }
};

// User API calls
export const userAPI = {
  getProfile: () => {
    return apiClient.get('/api/users/profile');
  },
  
  updateProfile: (userData) => {
    return apiClient.put('/api/users/profile', userData);
  }
};

// Course API calls
export const courseAPI = {
  getAllCourses: () => {
    return apiClient.get('/api/courses');
  },
  
  getCourse: (courseId) => {
    return apiClient.get(`/api/courses/${courseId}`);
  },
  
  createCourse: (courseData) => {
    return apiClient.post('/api/courses', courseData);
  },
  
  getUserCourses: () => {
    return apiClient.get('/api/user/courses');
  },
  
  addUserCourse: (courseId) => {
    return apiClient.post('/api/user/courses', { course_id: courseId });
  }
};

// Study Group API calls
export const groupAPI = {
  getAllGroups: () => {
    return apiClient.get('/api/groups');
  },
  
  getGroup: (groupId) => {
    return apiClient.get(`/api/groups/${groupId}`);
  },
  
  createGroup: (groupData) => {
    return apiClient.post('/api/groups', groupData);
  },
  
  getGroupMembers: (groupId) => {
    return apiClient.get(`/api/groups/${groupId}/members`);
  },
  
  joinGroup: (groupId) => {
    return apiClient.post(`/api/groups/${groupId}/join`);
  },
  
  leaveGroup: (groupId) => {
    return apiClient.delete(`/api/groups/${groupId}/leave`);
  }
};

// Matching API calls
export const matchingAPI = {
  findMatches: (params = {}) => {
    return apiClient.get('/api/matching/students', { params });
  }
};

const api = {
    auth: authAPI,
    user: userAPI,
    course: courseAPI,
    group: groupAPI,
    matching: matchingAPI
  };
  
  export default api;