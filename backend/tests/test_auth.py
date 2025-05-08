import pytest
import json
from app import app as flask_app
from app import db
from api.models.user import User

@pytest.fixture
def app():
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
    })
    
    with flask_app.app_context():
        db.create_all()
        
    yield flask_app
    
    with flask_app.app_context():
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_register(client):
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'user' in data
    assert data['user']['name'] == 'Test User'
    assert data['user']['email'] == 'test@example.com'
    assert 'token' in data

def test_login(client):
    # First register a user
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    # Then try to login
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'user' in data
    assert data['user']['email'] == 'test@example.com'
    assert 'token' in data