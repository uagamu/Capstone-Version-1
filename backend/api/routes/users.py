from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.user import User
from app import db

class UserProfile(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return {'message': 'User not found'}, 404
            
        return {'user': user.to_dict()}, 200
    
    @jwt_required()
    def put(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return {'message': 'User not found'}, 404
            
        data = request.get_json()
        
        # Update user fields
        if 'name' in data:
            user.name = data['name']
        if 'major' in data:
            user.major = data['major']
        if 'year' in data:
            user.year = data['year']
        if 'learning_style' in data:
            user.learning_style = data['learning_style']
            
        db.session.commit()
        
        return {'message': 'Profile updated successfully', 'user': user.to_dict()}, 200

def register_user_routes(api):
    api.add_resource(UserProfile, '/api/users/profile')