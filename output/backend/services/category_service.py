from models.category import Category
from models.device import Device
from models import db
from utils.exceptions import BadRequestException, NotFoundException, ConflictException


class CategoryService:
    @staticmethod
    def validate_name(name):
        name = (name or '').strip()
        if not name or len(name) > 20:
            raise BadRequestException('分类名称长度应在1-20个字符之间')
        return name

    @staticmethod
    def get_all():
        categories = Category.query.order_by(Category.created_at.desc()).all()
        return [c.to_dict() for c in categories]

    @staticmethod
    def get_by_id(category_id):
        category = Category.query.get(category_id)
        if not category:
            raise NotFoundException('分类不存在')
        return category.to_dict()

    @staticmethod
    def create(name):
        name = CategoryService.validate_name(name)
        existing = Category.query.filter_by(name=name).first()
        if existing:
            raise BadRequestException('分类名称已存在')
        category = Category(name=name, device_count=0)
        db.session.add(category)
        db.session.commit()
        return category.to_dict()

    @staticmethod
    def update(category_id, name):
        category = Category.query.get(category_id)
        if not category:
            raise NotFoundException('分类不存在')
        name = CategoryService.validate_name(name)
        existing = Category.query.filter(Category.id != category_id, Category.name == name).first()
        if existing:
            raise BadRequestException('分类名称已存在')
        category.name = name
        db.session.commit()
        return category.to_dict()

    @staticmethod
    def delete(category_id):
        category = Category.query.get(category_id)
        if not category:
            raise NotFoundException('分类不存在')
        has_devices = Device.query.filter_by(category_id=category_id).first()
        if has_devices:
            raise ConflictException('该分类下有设备，无法删除')
        db.session.delete(category)
        db.session.commit()

    @staticmethod
    def get_devices(category_id):
        category = Category.query.get(category_id)
        if not category:
            raise NotFoundException('分类不存在')
        devices = Device.query.filter_by(category_id=category_id).order_by(Device.created_at.desc()).all()
        return [d.to_dict() for d in devices]
