from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.models.user import User
from app import db, jwt
import firebase_admin
from firebase_admin import auth
import json

class Register(Resource):
    def post(self):
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return {'message': 'Missing required fields'}, 400
        
        try:
            # Create user in Firebase
            firebase_user = auth.create_user(
                email=data['email'],
                password=data['password'],
                display_name=data['name']
            )
            
            # Create user in our database
            user = User(
                id=firebase_user.uid,
                email=data['email'],
                name=data['name'],
                major=data.get('major'),
                year=data.get('year'),
                learning_style=data.get('learning_style')
            )
            
            db.session.add(user)
            db.session.commit()
            
            # Create access token
            access_token = create_access_token(identity=user.id)
            
            return {
                'message': 'User registered successfully',
                'token': access_token,
                'user': user.to_dict()
            }, 201
            
        except Exception as e:
            return {'message': str(e)}, 500

class Login(Resource):
    def post(self):
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return {'message': 'Missing email or password'}, 400
        
        try:
            # Sign in with Firebase
            firebase_user = auth.get_user_by_email(data['email'])
            
            # Get user from our database
            user = User.query.filter_by(id=firebase_user.uid).first()
            
            if not user:
                return {'message': 'User not found'}, 404
            
            # Create access token
            access_token = create_access_token(identity=user.id)
            
            return {
                'message': 'Login successful',
                'token': access_token,
                'user': user.to_dict()
            }, 200
            
        except Exception as e:
            return {'message': 'Invalid credentials'}, 401

def register_auth_routes(api):
    api.add_resource(Register, '/api/auth/register')
    api.add_resource(Login, '/api/auth/login')