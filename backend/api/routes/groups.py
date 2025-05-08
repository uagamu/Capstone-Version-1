from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.study_group import StudyGroup
from api.models.group_member import GroupMember
from api.models.user import User
from app import db

class StudyGroupList(Resource):
    def get(self):
        groups = StudyGroup.query.all()
        return {'groups': [group.to_dict() for group in groups]}, 200
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('course_id'):
            return {'message': 'Missing required fields'}, 400
            
        group = StudyGroup(
            name=data['name'],
            description=data.get('description', ''),
            course_id=data['course_id'],
            created_by=user_id
        )
        
        db.session.add(group)
        db.session.commit()
        
        # Add creator as a member
        member = GroupMember(
            group_id=group.id,
            user_id=user_id
        )
        
        db.session.add(member)
        db.session.commit()
        
        return {'message': 'Study group created successfully', 'group': group.to_dict()}, 201

class StudyGroupDetail(Resource):
    def get(self, group_id):
        group = StudyGroup.query.get(group_id)
        
        if not group:
            return {'message': 'Study group not found'}, 404
            
        return {'group': group.to_dict()}, 200

class StudyGroupMembers(Resource):
    def get(self, group_id):
        group = StudyGroup.query.get(group_id)
        
        if not group:
            return {'message': 'Study group not found'}, 404
            
        members = GroupMember.query.filter_by(group_id=group_id).all()
        user_ids = [member.user_id for member in members]
        users = User.query.filter(User.id.in_(user_ids)).all()
        
        return {'members': [user.to_dict() for user in users]}, 200

class JoinStudyGroup(Resource):
    @jwt_required()
    def post(self, group_id):
        user_id = get_jwt_identity()
        
        # Check if group exists
        group = StudyGroup.query.get(group_id)
        if not group:
            return {'message': 'Study group not found'}, 404
            
        # Check if user is already a member
        existing = GroupMember.query.filter_by(
            group_id=group_id,
            user_id=user_id
        ).first()
        
        if existing:
            return {'message': 'Already a member of this group'}, 400
            
        member = GroupMember(
            group_id=group_id,
            user_id=user_id
        )
        
        db.session.add(member)
        db.session.commit()
        
        return {'message': 'Joined study group successfully'}, 200

class LeaveStudyGroup(Resource):
    @jwt_required()
    def delete(self, group_id):
        user_id = get_jwt_identity()
        
        # Check if user is a member
        member = GroupMember.query.filter_by(
            group_id=group_id,
            user_id=user_id
        ).first()
        
        if not member:
            return {'message': 'Not a member of this group'}, 404
            
        db.session.delete(member)
        db.session.commit()
        
        return {'message': 'Left study group successfully'}, 200

def register_group_routes(api):
    api.add_resource(StudyGroupList, '/api/groups')
    api.add_resource(StudyGroupDetail, '/api/groups/<int:group_id>')
    api.add_resource(StudyGroupMembers, '/api/groups/<int:group_id>/members')
    api.add_resource(JoinStudyGroup, '/api/groups/<int:group_id>/join')
    api.add_resource(LeaveStudyGroup, '/api/groups/<int:group_id>/leave')