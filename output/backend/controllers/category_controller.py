from flask import Blueprint, request
from services.category_service import CategoryService
from middlewares.auth_middleware import token_required
from utils.response import success

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('', methods=['GET'])
@token_required
def list_categories():
    data = CategoryService.get_all()
    return success(data=data, message='查询成功')


@categories_bp.route('', methods=['POST'])
@token_required
def create_category():
    body = request.get_json(silent=True) or {}
    result = CategoryService.create(body.get('name', ''))
    return success(data=result, message='添加成功')


@categories_bp.route('/<int:category_id>', methods=['PUT'])
@token_required
def update_category(category_id):
    body = request.get_json(silent=True) or {}
    result = CategoryService.update(category_id, body.get('name', ''))
    return success(data=result, message='修改成功')


@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@token_required
def delete_category(category_id):
    CategoryService.delete(category_id)
    return success(message='删除成功')


@categories_bp.route('/<int:category_id>/devices', methods=['GET'])
@token_required
def get_category_devices(category_id):
    data = CategoryService.get_devices(category_id)
    return success(data=data, message='查询成功')
