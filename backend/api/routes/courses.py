from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.course import Course
from api.models.user_course import UserCourse
from app import db

class CourseList(Resource):
    def get(self):
        courses = Course.query.all()
        return {'courses': [course.to_dict() for course in courses]}, 200
    
    @jwt_required()
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('course_code') or not data.get('title'):
            return {'message': 'Missing required fields'}, 400
            
        course = Course(
            course_code=data['course_code'],
            title=data['title'],
            description=data.get('description', '')
        )
        
        db.session.add(course)
        db.session.commit()
        
        return {'message': 'Course created successfully', 'course': course.to_dict()}, 201

class CourseDetail(Resource):
    def get(self, course_id):
        course = Course.query.get(course_id)
        
        if not course:
            return {'message': 'Course not found'}, 404
            
        return {'course': course.to_dict()}, 200

class UserCourseList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user_courses = UserCourse.query.filter_by(user_id=user_id).all()
        course_ids = [uc.course_id for uc in user_courses]
        courses = Course.query.filter(Course.id.in_(course_ids)).all()
        
        return {'courses': [course.to_dict() for course in courses]}, 200
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('course_id'):
            return {'message': 'Missing course_id'}, 400
            
        # Check if course exists
        course = Course.query.get(data['course_id'])
        if not course:
            return {'message': 'Course not found'}, 404
            
        # Check if user already has this course
        existing = UserCourse.query.filter_by(
            user_id=user_id,
            course_id=data['course_id']
        ).first()
        
        if existing:
            return {'message': 'Course already added'}, 400
            
        user_course = UserCourse(
            user_id=user_id,
            course_id=data['course_id']
        )
        
        db.session.add(user_course)
        db.session.commit()
        
        return {'message': 'Course added successfully', 'user_course': user_course.to_dict()}, 201

def register_course_routes(api):
    api.add_resource(CourseList, '/api/courses')
    api.add_resource(CourseDetail, '/api/courses/<int:course_id>')
    api.add_resource(UserCourseList, '/api/user/courses')