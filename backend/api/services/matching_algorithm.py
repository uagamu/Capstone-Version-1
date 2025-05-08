from api.models.user import User
from api.models.user_course import UserCourse
from api.models.course import Course
from sqlalchemy import and_, not_

def calculate_compatibility_score(user, match, user_courses, match_courses, common_courses):
    """
    Calculate a compatibility score between two users
    """
    # Initialize score
    score = 0
    
    # Weight factors
    COMMON_COURSE_WEIGHT = 30
    LEARNING_STYLE_WEIGHT = 25
    YEAR_MATCH_WEIGHT = 15
    MAJOR_MATCH_WEIGHT = 20
    
    # Common courses (highest factor)
    course_overlap_percentage = len(common_courses) / max(len(user_courses), 1) * 100
    score += min(course_overlap_percentage, 100) * COMMON_COURSE_WEIGHT / 100
    
    # Learning style match
    if user.learning_style and match.learning_style:
        if user.learning_style == match.learning_style:
            score += LEARNING_STYLE_WEIGHT
        # Partial matches for compatible learning styles
        elif (user.learning_style == 'Visual' and match.learning_style == 'Reading/Writing') or \
             (user.learning_style == 'Reading/Writing' and match.learning_style == 'Visual'):
            score += LEARNING_STYLE_WEIGHT * 0.5
        elif (user.learning_style == 'Auditory' and match.learning_style == 'Kinesthetic') or \
             (user.learning_style == 'Kinesthetic' and match.learning_style == 'Auditory'):
            score += LEARNING_STYLE_WEIGHT * 0.5
    
    # Same year
    if user.year and match.year and user.year == match.year:
        score += YEAR_MATCH_WEIGHT
    
    # Same major
    if user.major and match.major and user.major == match.major:
        score += MAJOR_MATCH_WEIGHT
    
    return min(round(score, 1), 100)  # Cap at 100%

def find_matching_students(user_id, course_id=None, learning_style=None, limit=20):
    """
    Find matching students based on courses and learning styles with detailed compatibility calculation
    """
    # Get the user
    user = User.query.get(user_id)
    if not user:
        return []
    
    # Get user's courses
    user_courses_records = UserCourse.query.filter_by(user_id=user_id).all()
    user_course_ids = [uc.course_id for uc in user_courses_records]
    
    # Base query to find other users
    query = User.query.filter(User.id != user_id)
    
    # Filter by specific course if provided
    if course_id:
        course_users = UserCourse.query.filter_by(course_id=course_id).all()
        course_user_ids = [cu.user_id for cu in course_users]
        query = query.filter(User.id.in_(course_user_ids))
    else:
        # Find users with common courses
        if user_course_ids:
            common_course_users = UserCourse.query.filter(
                UserCourse.course_id.in_(user_course_ids),
                UserCourse.user_id != user_id
            ).all()
            common_course_user_ids = list(set([cu.user_id for cu in common_course_users]))
            query = query.filter(User.id.in_(common_course_user_ids))
    
    # Filter by learning style if provided
    if learning_style:
        query = query.filter(User.learning_style == learning_style)
    
    # Get the results
    potential_matches = query.all()
    
    # Calculate match score and prepare results
    result = []
    for match in potential_matches:
        # Get match's courses
        match_courses_records = UserCourse.query.filter_by(user_id=match.id).all()
        match_course_ids = [mc.course_id for mc in match_courses_records]
        
        # Find common courses
        common_course_ids = set(user_course_ids).intersection(set(match_course_ids))
        
        # Get common course details
        common_courses = []
        if common_course_ids:
            common_courses = Course.query.filter(Course.id.in_(common_course_ids)).all()
        
        # Calculate compatibility score
        match_score = calculate_compatibility_score(
            user, match, user_course_ids, match_course_ids, common_courses
        )
        
        # Create result entry
        result.append({
            'user': match.to_dict(),
            'match_score': match_score,
            'common_courses': len(common_courses),
            'common_course_details': [course.to_dict() for course in common_courses]
        })
    
    # Sort by match score
    result.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Limit results
    return result[:limit]