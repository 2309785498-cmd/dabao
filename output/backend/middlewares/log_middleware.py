import time
import logging
from flask import request, g


def setup_logging(app):
    """配置日志：同时输出到控制台和文件（RotatingFileHandler）"""
    import os
    from logging.handlers import RotatingFileHandler

    log_dir = os.path.dirname(app.config.get('LOG_FILE', 'logs/app.log'))
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    handler = RotatingFileHandler(
        app.config['LOG_FILE'],
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    ))
    handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s: %(message)s'
    ))
    console_handler.setLevel(logging.INFO)

    app.logger.addHandler(handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)

    @app.before_request
    def before_request():
        g.start_time = time.time()
        app.logger.info(f'>>> {request.method} {request.path} | IP: {request.remote_addr}')

    @app.after_request
    def after_request(response):
        elapsed = int((time.time() - g.get('start_time', time.time())) * 1000)
        app.logger.info(f'<<< {request.method} {request.path} | {response.status_code} | {elapsed}ms')
        return response
