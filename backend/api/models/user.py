from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.String(128), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    major = db.Column(db.String(120), nullable=True)
    year = db.Column(db.String(20), nullable=True)
    learning_style = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'major': self.major,
            'year': self.year,
            'learning_style': self.learning_style,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }