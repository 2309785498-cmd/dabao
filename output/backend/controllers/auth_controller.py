from flask import Blueprint, request
from services.auth_service import AuthService
from utils.response import success
from utils.exceptions import BadRequestException

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    if not username or not password:
        raise BadRequestException('用户名和密码不能为空')
    result = AuthService.login(username, password)
    return success(data=result, message='登录成功')
