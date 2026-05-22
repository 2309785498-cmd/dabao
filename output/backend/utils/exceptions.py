class AppException(Exception):
    """业务异常基类"""
    def __init__(self, message='服务器错误', code=500):
        self.message = message
        self.code = code
        super().__init__(self.message)


class BadRequestException(AppException):
    def __init__(self, message='请求参数错误'):
        super().__init__(message, 400)


class UnauthorizedException(AppException):
    def __init__(self, message='未授权，请先登录'):
        super().__init__(message, 401)


class NotFoundException(AppException):
    def __init__(self, message='资源不存在'):
        super().__init__(message, 404)


class ConflictException(AppException):
    def __init__(self, message='操作冲突'):
        super().__init__(message, 409)
