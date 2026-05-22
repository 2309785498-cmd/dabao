from datetime import datetime
from . import db


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False, unique=True)
    device_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    devices = db.relationship('Device', backref='category', lazy='dynamic',
                              foreign_keys='Device.category_id')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'deviceCount': self.device_count,
            'createdAt': self.created_at.isoformat() + 'Z' if self.created_at else None,
        }
