from flask import Blueprint, request
from services.employee_service import EmployeeService
from middlewares.auth_middleware import token_required
from utils.response import success

employees_bp = Blueprint('employees', __name__)


@employees_bp.route('', methods=['GET'])
@token_required
def list_employees():
    data = EmployeeService.get_all()
    return success(data=data, message='查询成功')


@employees_bp.route('/<int:employee_id>', methods=['GET'])
@token_required
def get_employee(employee_id):
    data = EmployeeService.get_by_id(employee_id)
    return success(data=data, message='查询成功')


@employees_bp.route('', methods=['POST'])
@token_required
def create_employee():
    data = request.get_json(silent=True) or {}
    result = EmployeeService.create(data)
    return success(data=result, message='添加成功')


@employees_bp.route('/<int:employee_id>', methods=['PUT'])
@token_required
def update_employee(employee_id):
    data = request.get_json(silent=True) or {}
    result = EmployeeService.update(employee_id, data)
    return success(data=result, message='修改成功')


@employees_bp.route('/<int:employee_id>', methods=['DELETE'])
@token_required
def delete_employee(employee_id):
    EmployeeService.delete(employee_id)
    return success(message='删除成功')
