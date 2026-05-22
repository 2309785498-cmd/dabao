import re
from models.employee import Employee
from models import db
from utils.exceptions import BadRequestException, NotFoundException


class EmployeeService:
    @staticmethod
    def validate(data):
        name = (data.get('name') or '').strip()
        age = data.get('age')
        email = (data.get('email') or '').strip()

        errors = []
        if not name or len(name) > 20:
            errors.append('姓名长度应在1-20个字符之间')
        if not isinstance(age, int) or age < 18 or age > 60:
            errors.append('年龄应在18-60之间')
        if not email or not re.match(r'^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$', email, re.IGNORECASE):
            errors.append('邮箱格式不合法')

        if errors:
            raise BadRequestException('; '.join(errors))
        return {'name': name, 'age': age, 'email': email}

    @staticmethod
    def get_all():
        employees = Employee.query.order_by(Employee.created_at.desc()).all()
        return [e.to_dict() for e in employees]

    @staticmethod
    def get_by_id(employee_id):
        employee = Employee.query.get(employee_id)
        if not employee:
            raise NotFoundException('员工不存在')
        return employee.to_dict()

    @staticmethod
    def create(data):
        validated = EmployeeService.validate(data)
        employee = Employee(**validated)
        db.session.add(employee)
        db.session.commit()
        return employee.to_dict()

    @staticmethod
    def update(employee_id, data):
        employee = Employee.query.get(employee_id)
        if not employee:
            raise NotFoundException('员工不存在')
        validated = EmployeeService.validate(data)
        employee.name = validated['name']
        employee.age = validated['age']
        employee.email = validated['email']
        db.session.commit()
        return employee.to_dict()

    @staticmethod
    def delete(employee_id):
        employee = Employee.query.get(employee_id)
        if not employee:
            raise NotFoundException('员工不存在')
        db.session.delete(employee)
        db.session.commit()
