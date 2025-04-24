from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    """Modelo para usuários do sistema (nutricionistas)"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    patients = db.relationship('Patient', backref='nutritionist', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'
        
class Patient(db.Model):
    """Modelo para pacientes cadastrados"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    birthday = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    measurements = db.relationship('Measurement', backref='patient', lazy=True, cascade="all, delete-orphan")
    meal_plans = db.relationship('MealPlan', backref='patient', lazy=True, cascade="all, delete-orphan")
    consultations = db.relationship('Consultation', backref='patient', lazy=True, cascade="all, delete-orphan")
    
    @property
    def age(self):
        if self.birthday:
            today = datetime.now().date()
            return today.year - self.birthday.year - ((today.month, today.day) < (self.birthday.month, self.birthday.day))
        return None
    
    def __repr__(self):
        return f'<Patient {self.name}>'

class Measurement(db.Model):
    """Modelo para medidas antropométricas"""
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    weight = db.Column(db.Float, nullable=False)  # kg
    height = db.Column(db.Float, nullable=False)  # cm
    waist = db.Column(db.Float, nullable=True)    # cm
    hip = db.Column(db.Float, nullable=True)      # cm
    body_fat = db.Column(db.Float, nullable=True) # %
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    
    @property
    def imc(self):
        """Calcula o Índice de Massa Corporal"""
        if self.height and self.weight:
            height_m = self.height / 100  # converter cm para m
            return round(self.weight / (height_m ** 2), 2)
        return None
    
    @property
    def imc_classification(self):
        """Retorna a classificação do IMC"""
        imc = self.imc
        if imc is None:
            return "Não calculado"
        
        if imc < 18.5:
            return "Abaixo do peso"
        elif imc < 25:
            return "Peso normal"
        elif imc < 30:
            return "Sobrepeso"
        elif imc < 35:
            return "Obesidade Grau I"
        elif imc < 40:
            return "Obesidade Grau II"
        else:
            return "Obesidade Grau III"
    
    @property
    def tmb(self):
        """Calcula a Taxa Metabólica Basal (fórmula de Harris-Benedict)"""
        patient = Patient.query.get(self.patient_id)
        if not patient or not patient.gender or not patient.age:
            return None
        
        if patient.gender.lower() == 'masculino':
            return round(88.362 + (13.397 * self.weight) + (4.799 * self.height) - (5.677 * patient.age), 2)
        else:
            return round(447.593 + (9.247 * self.weight) + (3.098 * self.height) - (4.330 * patient.age), 2)
    
    def __repr__(self):
        return f'<Measurement {self.date} - {self.weight}kg>'

class MealPlan(db.Model):
    """Modelo para planos alimentares"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    total_calories = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    meals = db.relationship('Meal', backref='meal_plan', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<MealPlan {self.title}>'

class Meal(db.Model):
    """Modelo para refeições dentro do plano alimentar"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)  # Café da manhã, Almoço, etc.
    time = db.Column(db.String(10), nullable=True)   # Horário sugerido
    description = db.Column(db.Text, nullable=False)
    calories = db.Column(db.Integer, nullable=True)
    proteins = db.Column(db.Float, nullable=True)    # gramas
    carbs = db.Column(db.Float, nullable=True)       # gramas
    fats = db.Column(db.Float, nullable=True)        # gramas
    meal_plan_id = db.Column(db.Integer, db.ForeignKey('meal_plan.id'), nullable=False)
    
    def __repr__(self):
        return f'<Meal {self.name}>'

class Consultation(db.Model):
    """Modelo para consultas nutricionais"""
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    next_appointment = db.Column(db.DateTime, nullable=True)
    consultation_type = db.Column(db.String(50), nullable=False)  # Primeira consulta, Retorno, etc.
    status = db.Column(db.String(20), nullable=False, default='Agendada')  # Agendada, Realizada, Cancelada
    main_complaint = db.Column(db.Text, nullable=True)
    objective = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    consultation_details = db.relationship('ConsultationDetail', backref='consultation', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Consultation {self.date} - {self.consultation_type}>'

class ConsultationDetail(db.Model):
    """Modelo para detalhes específicos da consulta (sub-abas)"""
    id = db.Column(db.Integer, primary_key=True)
    tab_name = db.Column(db.String(50), nullable=False)  # Nome da sub-aba
    data = db.Column(db.JSON, nullable=True)  # Dados específicos da sub-aba em formato JSON
    text_data = db.Column(db.Text, nullable=True)  # Dados em formato texto para campos longos
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultation.id'), nullable=False)
    
    def __repr__(self):
        return f'<ConsultationDetail {self.tab_name}>'
