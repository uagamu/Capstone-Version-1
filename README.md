# Smart Study Group Finder

A web application that matches students for study groups based on courses, learning styles, and academic goals.

## Features

- User authentication and profile management
- Course enrollment and management
- Study group creation and participation
- Smart matching algorithm to find compatible study partners
- Firebase integration for authentication

## Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Flask (Python) with RESTful API
- **Database**: SQLite with SQLAlchemy ORM (in development), can be switched to PostgreSQL for production
- **Authentication**: Firebase Authentication with JWT for backend requests

## Project Structure

```
smart-study-finder/
├── backend/                  # Flask backend
│   ├── api/                  # API routes and models
│   ├── migrations/           # Database migrations
│   ├── app.py               # Main application file
│   ├── wsgi.py              # WSGI entry point
│   └── ...
└── frontend/                 # React frontend
    ├── public/               # Static files
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── services/         # API service
    │   ├── hooks/            # Custom React hooks
    │   ├── App.js            # Main application component
    │   └── ...
    └── ...
```

## Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Firebase account with a project set up

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up your Firebase service account credentials:
   - Download your Firebase service account key file from the Firebase console
   - Set the environment variable `FIREBASE_CREDENTIALS_PATH` to point to this file

6. Configure environment variables (create a `.env` file in the backend directory):
   ```
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret-key
   DATABASE_URL=sqlite:///app.db
   FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json
   ```

7. Initialize the database:
   ```
   flask db upgrade
   ```

8. Seed the database with initial data (optional):
   ```
   python -m api.utils.seed_data
   ```

9. Run the development server:
   ```
   flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the Firebase configuration in `src/App.js` with your Firebase project details

4. Create a `.env` file with the backend API URL:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

5. Start the development server:
   ```
   npm start
   ```

6. Open your browser and go to `http://localhost:3000`

## Deployment

### Backend

1. Set up a production server with Gunicorn:
   ```
   pip install gunicorn
   gunicorn -c gunicorn_config.py wsgi:app
   ```

2. Use Nginx or Apache as a reverse proxy

### Frontend

1. Build the production version:
   ```
   npm run build
   ```

2. Deploy the static files from the `build` directory to your web server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.