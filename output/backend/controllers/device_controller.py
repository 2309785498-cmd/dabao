from flask import Blueprint, request
from services.device_service import DeviceService
from middlewares.auth_middleware import token_required
from utils.response import success

devices_bp = Blueprint('devices', __name__)


@devices_bp.route('', methods=['GET'])
@token_required
def list_devices():
    category_id = request.args.get('category_id', type=int)
    data = DeviceService.get_all(category_id=category_id)
    return success(data=data, message='查询成功')


@devices_bp.route('', methods=['POST'])
@token_required
def create_device():
    body = request.get_json(silent=True) or {}
    result = DeviceService.create(body)
    return success(data=result, message='添加成功')
