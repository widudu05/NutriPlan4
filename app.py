from flask import Flask, send_from_directory
from markupsafe import Markup
from models import db, User
from routes import main, auth, patient_bp, meal_bp, consultation_bp
from food_routes import food_bp
from config import Config
import os
import markdown

def create_app(config_class=Config):
    """Função para criar e configurar a aplicação Flask"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicialização de extensões
    db.init_app(app)
    
    # Filtro para converter markdown para HTML
    @app.template_filter('markdown')
    def render_markdown(text):
        if text:
            return Markup(markdown.markdown(text))
        return ""
        
    # Filtro para converter quebras de linha em <br>
    @app.template_filter('nl2br')
    def nl2br(text):
        if text:
            # Substituir tanto \n quanto literais \\n
            text = text.replace('\\n', '\n')  # Primeiro, converte \\n para \n
            return Markup(text.replace('\n', '<br>'))
        return ""
    
    # Registro de blueprints
    app.register_blueprint(auth)
    app.register_blueprint(main)
    app.register_blueprint(patient_bp, url_prefix='/patient')
    app.register_blueprint(meal_bp, url_prefix='/meal')
    app.register_blueprint(consultation_bp, url_prefix='/consultation')
    app.register_blueprint(food_bp)
    
    # Rota para servir arquivos estáticos
    @app.route('/static/<path:path>')
    def send_static(path):
        return send_from_directory('static', path)
    
    # Criar banco de dados se não existir
    with app.app_context():
        db.create_all()
        
        # Criar usuário admin se não existir
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', email='admin@nutriplan.com')
            admin.set_password('Admin123')
            db.session.add(admin)
            db.session.commit()
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
