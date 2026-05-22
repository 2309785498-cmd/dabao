import jwt
from datetime import datetime, timedelta
from flask import current_app


def generate_token(admin_id, role='admin'):
    """生成 JWT token"""
    payload = {
        'admin_id': admin_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=current_app.config.get('JWT_EXPIRATION_HOURS', 2)),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm='HS256')


def verify_token(token):
    """验证 JWT token，返回 payload 或抛出异常"""
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except jwt.InvalidTokenError:
        raise
