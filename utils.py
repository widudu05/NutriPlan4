import re
from datetime import datetime
from functools import wraps
from flask import session, redirect, url_for, flash

def login_required(f):
    """Decorator para verificar se o usuário está logado"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Por favor, faça login para acessar esta página.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

def validate_email(email):
    """Valida o formato do email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """
    Valida a força da senha
    Deve ter pelo menos 8 caracteres, uma letra maiúscula,
    uma letra minúscula e um número
    """
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

def format_date(date_str, input_format='%Y-%m-%d'):
    """Converte string para objeto datetime"""
    try:
        return datetime.strptime(date_str, input_format).date()
    except (ValueError, TypeError):
        return None

def format_date_display(date_obj):
    """Formata data para exibição"""
    if not date_obj:
        return ""
    return date_obj.strftime('%d/%m/%Y')

def calculate_energy_needs(tmb, activity_level):
    """
    Calcula necessidades energéticas baseado na TMB e nível de atividade
    
    activity_level: string 
    - 'sedentary': pouca ou nenhuma atividade
    - 'light': exercício leve (1-3 dias por semana)
    - 'moderate': exercício moderado (3-5 dias por semana)
    - 'active': exercício intenso (6-7 dias por semana)
    - 'very_active': exercício muito intenso ou trabalho físico
    """
    factors = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    
    factor = factors.get(activity_level, 1.2)  # default para sedentário
    return round(tmb * factor)

def calculate_macros(total_calories, protein_pct=0.25, fat_pct=0.25):
    """
    Calcula distribuição de macronutrientes baseado nas calorias totais
    
    Args:
        total_calories (int): Total de calorias diárias
        protein_pct (float): Porcentagem de proteínas (padrão: 25%)
        fat_pct (float): Porcentagem de gorduras (padrão: 25%)
    
    Returns:
        dict: Contendo gramas de proteínas, carboidratos e gorduras
    """
    # Calorias por grama
    protein_cal_per_g = 4
    carb_cal_per_g = 4
    fat_cal_per_g = 9
    
    # Calorias para cada macronutriente
    protein_cals = total_calories * protein_pct
    fat_cals = total_calories * fat_pct
    carb_cals = total_calories - protein_cals - fat_cals
    
    # Converter para gramas
    protein_g = round(protein_cals / protein_cal_per_g)
    fat_g = round(fat_cals / fat_cal_per_g)
    carb_g = round(carb_cals / carb_cal_per_g)
    
    return {
        'protein': protein_g,
        'carbs': carb_g,
        'fat': fat_g
    }

def create_default_consultation_tabs(consultation, db_session):
    """
    Cria as abas padrão para uma nova consulta com base no Excel fornecido
    
    Args:
        consultation: Objeto do tipo Consultation
        db_session: Sessão ativa do banco de dados para adicionar os objetos
    
    Returns:
        None
    """
    from models import ConsultationDetail
    
    # Lista de abas padrão baseadas no arquivo Excel
    default_tabs = [
        {
            "name": "QPC", 
            "title": "Questionário de Pré-Consulta",
            "text_data": "# Questionário de Pré-Consulta\n\nUse este espaço para registrar as respostas do questionário pré-consulta do paciente."
        },
        {
            "name": "Anamnese", 
            "title": "Anamnese Smart",
            "text_data": "# Anamnese Smart\n\n## Queixa Principal\n\n## Histórico Clínico\n\n## Histórico Familiar\n\n## Hábitos de Vida\n\n## Uso de Medicamentos\n\n## Alergias e Intolerâncias"
        },
        {
            "name": "Exames", 
            "title": "Marcadores bioquímicos",
            "text_data": "# Marcadores Bioquímicos\n\n## Exames de Sangue\n\n## Outros Exames\n\n## Observações"
        },
        {
            "name": "Consumo", 
            "title": "Consumo alimentar",
            "text_data": "# Consumo Alimentar\n\n## Recordatório Habitual\n\n## Preferências Alimentares\n\n## Aversões Alimentares\n\n## Horários das Refeições"
        },
        {
            "name": "Antropometria", 
            "title": "Avaliação antropométrica",
            "text_data": "# Avaliação Antropométrica\n\n## Medições Atuais\n\n## Composição Corporal\n\n## Histórico de Peso"
        },
        {
            "name": "Conduta", 
            "title": "Evolução e Conduta",
            "text_data": "# Evolução e Conduta\n\n## Diagnóstico Nutricional\n\n## Objetivos do Tratamento\n\n## Conduta Nutricional\n\n## Próximos Passos"
        },
        {
            "name": "Medidas", 
            "title": "Medidas Detalhadas",
            "text_data": "# Medidas Detalhadas\n\n## Dobras Cutâneas\n\n## Circunferências\n\n## Cálculos Específicos"
        },
        {
            "name": "Orientações", 
            "title": "Orientações ao Paciente",
            "text_data": "# Orientações ao Paciente\n\n## Recomendações Gerais\n\n## Lista de Substituições\n\n## Material Educativo"
        }
    ]
    
    # Criar e adicionar as abas
    for tab in default_tabs:
        consultation_detail = ConsultationDetail(
            tab_name=tab["title"],
            text_data=tab["text_data"],
            consultation_id=consultation.id
        )
        db_session.add(consultation_detail)
    
    # Não é necessário fazer commit aqui, será feito no contexto que chamou esta função
