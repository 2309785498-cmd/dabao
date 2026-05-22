import bcrypt
from models.admin import Admin
from models import db
from utils.jwt_utils import generate_token
from utils.exceptions import BadRequestException


class AuthService:
    @staticmethod
    def login(username, password):
        admin = Admin.query.filter_by(username=username).first()
        if not admin:
            raise BadRequestException('用户名或密码错误')
        if not bcrypt.checkpw(password.encode('utf-8'), admin.password_hash.encode('utf-8')):
            raise BadRequestException('用户名或密码错误')
        token = generate_token(admin.id, admin.role)
        return {'token': token, 'username': admin.username, 'role': admin.role}
