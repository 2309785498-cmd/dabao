from datetime import datetime
from . import db


class Device(db.Model):
    __tablename__ = 'devices'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id',
                            ondelete='RESTRICT'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model or '',
            'categoryId': self.category_id,
            'categoryName': self.category.name if self.category else '',
            'createdAt': self.created_at.isoformat() + 'Z' if self.created_at else None,
        }
