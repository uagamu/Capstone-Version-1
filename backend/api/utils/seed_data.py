from app import app, db
from api.models.course import Course

def seed_courses():
    # Sample courses data
    courses = [
        {'course_code': 'CS101', 'title': 'Introduction to Computer Science', 'description': 'Basic principles of programming and algorithm development.'},
        {'course_code': 'MATH201', 'title': 'Calculus II', 'description': 'Advanced calculus topics including integration techniques.'},
        {'course_code': 'BIO150', 'title': 'General Biology', 'description': 'Introduction to biology principles and concepts.'},
        # Other courses as defined in the artifact
    ]
    
    # Insert courses with an application context
    with app.app_context():
        for course_data in courses:
            course = Course.query.filter_by(course_code=course_data['course_code']).first()
            if not course:
                course = Course(**course_data)
                db.session.add(course)
        
        db.session.commit()
        print(f"Successfully seeded {len(courses)} courses.")

if __name__ == '__main__':
    seed_courses()