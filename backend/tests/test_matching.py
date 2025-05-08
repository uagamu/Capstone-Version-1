import pytest
import json
from app import app as flask_app
from app import db
from api.models.user import User
from api.models.course import Course
from api.models.user_course import UserCourse
from api.services.matching_algorithm import find_matching_students

@pytest.fixture
def app():
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
    })
    
    with flask_app.app_context():
        db.create_all()
        
        # Create test users
        user1 = User(id='user1', email='user1@example.com', name='User One', 
                     major='Computer Science', year='Sophomore', learning_style='Visual')
        user2 = User(id='user2', email='user2@example.com', name='User Two',
                     major='Computer Science', year='Sophomore', learning_style='Visual')
        user3 = User(id='user3', email='user3@example.com', name='User Three',
                     major='Biology', year='Junior', learning_style='Auditory')
        
        # Create test courses
        course1 = Course(id=1, course_code='CS101', title='Intro to CS')
        course2 = Course(id=2, course_code='CS201', title='Data Structures')
        course3 = Course(id=3, course_code='BIO101', title='Intro to Biology')
        
        db.session.add_all([user1, user2, user3, course1, course2, course3])
        db.session.commit()
        
        # Assign courses to users
        uc1 = UserCourse(user_id='user1', course_id=1)
        uc2 = UserCourse(user_id='user1', course_id=2)
        uc3 = UserCourse(user_id='user2', course_id=1)
        uc4 = UserCourse(user_id='user3', course_id=3)
        
        db.session.add_all([uc1, uc2, uc3, uc4])
        db.session.commit()
        
    yield flask_app
    
    with flask_app.app_context():
        db.drop_all()

def test_find_matching_students(app):
    with app.app_context():
        # Find matches for user1
        matches = find_matching_students('user1')
        
        # Should match with user2 but not user3
        assert len(matches) > 0
        
        # First match should be user2
        assert matches[0]['user']['id'] == 'user2'
        
        # Check common courses
        assert matches[0]['common_courses'] == 1
        
        # Filter by course
        course_matches = find_matching_students('user1', course_id=1)
        assert len(course_matches) > 0
        assert course_matches[0]['user']['id'] == 'user2'
        
        # Filter by learning style
        style_matches = find_matching_students('user1', learning_style='Visual')
        assert len(style_matches) > 0
        assert style_matches[0]['user']['id'] == 'user2'
        
        # No matches for this combination
        no_matches = find_matching_students('user1', learning_style='Auditory')
        assert len(no_matches) == 0