from models.device import Device
from models.category import Category
from models import db
from utils.exceptions import BadRequestException, NotFoundException


class DeviceService:
    @staticmethod
    def validate(data):
        name = (data.get('name') or '').strip()
        model = (data.get('model') or '').strip()
        category_id = data.get('categoryId')

        if not name:
            raise BadRequestException('设备名称不能为空')
        if not category_id:
            raise BadRequestException('请选择所属分类')
        return {'name': name, 'model': model, 'category_id': int(category_id)}

    @staticmethod
    def get_all(category_id=None):
        query = Device.query.order_by(Device.created_at.desc())
        if category_id:
            query = query.filter_by(category_id=category_id)
        devices = query.all()
        return [d.to_dict() for d in devices]

    @staticmethod
    def create(data):
        validated = DeviceService.validate(data)
        category = Category.query.get(validated['category_id'])
        if not category:
            raise BadRequestException('分类不存在')
        device = Device(**validated)
        db.session.add(device)
        db.session.commit()
        return device.to_dict()
