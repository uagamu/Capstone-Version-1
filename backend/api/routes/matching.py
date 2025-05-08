from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.user import User
from api.models.user_course import UserCourse
from api.models.course import Course
from api.models.study_group import StudyGroup
from api.models.group_member import GroupMember
from api.services.matching_algorithm import find_matching_students
from app import db

class MatchingStudents(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        
        # Get matching parameters
        course_id = request.args.get('course_id')
        learning_style = request.args.get('learning_style')
        
        # Find matching students
        matches = find_matching_students(user_id, course_id, learning_style)
        
        return {'matches': matches}, 200

def register_matching_routes(api):
    api.add_resource(MatchingStudents, '/api/matching/students')