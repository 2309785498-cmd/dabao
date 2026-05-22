import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from config import config_map
from models import db
from middlewares.log_middleware import setup_logging
from utils.exceptions import (
    AppException, BadRequestException, UnauthorizedException,
    NotFoundException, ConflictException
)


def create_app():
    app = Flask(__name__)

    env = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config_map.get(env, config_map['default']))

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    setup_logging(app)

    # ---- 注册蓝图 ----
    from controllers.auth_controller import auth_bp
    from controllers.employee_controller import employees_bp
    from controllers.category_controller import categories_bp
    from controllers.device_controller import devices_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(devices_bp, url_prefix='/api/devices')

    # ---- 全局异常处理器 ----
    @app.errorhandler(BadRequestException)
    @app.errorhandler(400)
    def handle_400(error):
        msg = error.message if hasattr(error, 'message') else str(error)
        return jsonify({'code': 400, 'message': msg, 'data': None}), 400

    @app.errorhandler(UnauthorizedException)
    @app.errorhandler(401)
    def handle_401(error):
        msg = error.message if hasattr(error, 'message') else '未授权，请先登录'
        return jsonify({'code': 401, 'message': msg, 'data': None}), 401

    @app.errorhandler(NotFoundException)
    @app.errorhandler(404)
    def handle_404(error):
        msg = error.message if hasattr(error, 'message') else '资源不存在'
        return jsonify({'code': 404, 'message': msg, 'data': None}), 404

    @app.errorhandler(ConflictException)
    def handle_409(error):
        return jsonify({'code': 409, 'message': error.message, 'data': None}), 409

    @app.errorhandler(AppException)
    def handle_app_error(error):
        return jsonify({'code': error.code, 'message': error.message, 'data': None}), error.code

    @app.errorhandler(Exception)
    def handle_500(error):
        app.logger.error(f'Unhandled exception: {error}', exc_info=True)
        return jsonify({'code': 500, 'message': '服务器内部错误', 'data': None}), 500

    # ---- 创建表 ----
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
