import logging
from functools import wraps
from flask import request
from utils.jwt_utils import verify_token
from utils.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)


def token_required(f):
    """JWT 认证装饰器 —— 从 Authorization: Bearer <token> 解析并验证"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            raise UnauthorizedException('未提供有效的认证令牌')
        token = auth_header[7:]
        try:
            payload = verify_token(token)
            request.current_user = payload
        except Exception:
            raise UnauthorizedException('令牌无效或已过期')
        return f(*args, **kwargs)
    return decorated
