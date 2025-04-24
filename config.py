import os

class Config:
    """Classe de configuração da aplicação"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'chave_secreta_padrao')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///nutriplan.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Configuração de debug
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    # Configs de pasta
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
