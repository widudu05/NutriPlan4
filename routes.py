from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from models import db, User, Patient, Measurement, MealPlan, Meal
from utils import login_required, validate_email, validate_password, format_date, format_date_display
from utils import calculate_energy_needs, calculate_macros
from datetime import datetime, timedelta
from sqlalchemy import desc
import json

# Criação do blueprint para organizar as rotas
main = Blueprint('main', __name__)
auth = Blueprint('auth', __name__)
patient_bp = Blueprint('patient', __name__)
meal_bp = Blueprint('meal', __name__)

# Rotas de autenticação
@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('main.dashboard'))
        else:
            flash('Nome de usuário ou senha incorretos.', 'danger')
    
    return render_template('index.html')

@auth.route('/logout')
def logout():
    session.clear()
    flash('Você foi desconectado.', 'info')
    return redirect(url_for('auth.login'))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validações
        if not all([username, email, password, confirm_password]):
            flash('Todos os campos são obrigatórios!', 'danger')
            return render_template('register.html')
            
        if not validate_email(email):
            flash('E-mail inválido.', 'danger')
            return render_template('register.html')
            
        if not validate_password(password):
            flash('A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número.', 'danger')
            return render_template('register.html')
            
        if password != confirm_password:
            flash('As senhas não coincidem.', 'danger')
            return render_template('register.html')
            
        # Verificar se usuário já existe
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Nome de usuário ou e-mail já cadastrado.', 'danger')
            return render_template('register.html')
            
        # Criar novo usuário
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
        return redirect(url_for('auth.login'))
        
    return render_template('register.html')

# Rotas principais
@main.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('main.dashboard'))
    return render_template('index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    user_id = session.get('user_id')
    total_patients = Patient.query.filter_by(user_id=user_id).count()
    recent_patients = Patient.query.filter_by(user_id=user_id).order_by(desc(Patient.created_at)).limit(5).all()
    
    # Dados para gráficos e estatísticas
    # Exemplo: pacientes por mês (últimos 6 meses)
    patients_by_month = []
    today = datetime.now()
    for i in range(5, -1, -1):
        month_date = today - timedelta(days=30*i)
        month_name = month_date.strftime('%b')
        month_start = datetime(month_date.year, month_date.month, 1)
        if month_date.month == 12:
            month_end = datetime(month_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end = datetime(month_date.year, month_date.month + 1, 1) - timedelta(days=1)
        
        count = Patient.query.filter_by(user_id=user_id).filter(
            Patient.created_at >= month_start,
            Patient.created_at <= month_end
        ).count()
        
        patients_by_month.append({
            'month': month_name,
            'count': count
        })
    
    return render_template('dashboard.html', 
                          total_patients=total_patients, 
                          recent_patients=recent_patients,
                          patients_by_month=json.dumps(patients_by_month))

# Rotas de Pacientes
@patient_bp.route('/patients')
@login_required
def patients_list():
    user_id = session.get('user_id')
    patients = Patient.query.filter_by(user_id=user_id).order_by(Patient.name).all()
    return render_template('patients.html', patients=patients)

@patient_bp.route('/patient/add', methods=['GET', 'POST'])
@login_required
def add_patient():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email', '')
        phone = request.form.get('phone', '')
        birthday_str = request.form.get('birthday', '')
        gender = request.form.get('gender', '')
        
        # Validações básicas
        if not name:
            flash('O nome do paciente é obrigatório.', 'danger')
            return redirect(url_for('patient.add_patient'))
            
        if email and not validate_email(email):
            flash('E-mail inválido.', 'danger')
            return redirect(url_for('patient.add_patient'))
        
        # Verificar se já existe paciente com este email
        if email:
            existing_patient = Patient.query.filter_by(email=email).first()
            if existing_patient:
                flash('Já existe um paciente cadastrado com este e-mail.', 'danger')
                return redirect(url_for('patient.add_patient'))
        
        # Converter data
        birthday = format_date(birthday_str) if birthday_str else None
        
        # Criar paciente
        new_patient = Patient(
            name=name,
            email=email,
            phone=phone,
            birthday=birthday,
            gender=gender,
            user_id=session.get('user_id')
        )
        
        db.session.add(new_patient)
        db.session.commit()
        
        flash('Paciente cadastrado com sucesso!', 'success')
        return redirect(url_for('patient.patient_detail', patient_id=new_patient.id))
    
    return render_template('patient_detail.html', patient=None, is_new=True)

@patient_bp.route('/patient/<int:patient_id>')
@login_required
def patient_detail(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para acessar este paciente.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    # Obter última medição
    last_measurement = Measurement.query.filter_by(patient_id=patient_id).order_by(desc(Measurement.date)).first()
    
    # Obter plano alimentar atual
    today = datetime.now().date()
    current_meal_plan = MealPlan.query.filter_by(patient_id=patient_id).filter(
        MealPlan.start_date <= today,
        (MealPlan.end_date >= today) | (MealPlan.end_date == None)
    ).order_by(desc(MealPlan.start_date)).first()
    
    # Obter histórico de medições para gráficos
    measurements = Measurement.query.filter_by(patient_id=patient_id).order_by(Measurement.date).all()
    weight_data = [{'date': m.date.strftime('%d/%m/%Y'), 'value': m.weight} for m in measurements]
    imc_data = [{'date': m.date.strftime('%d/%m/%Y'), 'value': m.imc} for m in measurements if m.imc]
    
    return render_template('patient_detail.html', 
                          patient=patient, 
                          last_measurement=last_measurement,
                          current_meal_plan=current_meal_plan,
                          weight_data=json.dumps(weight_data),
                          imc_data=json.dumps(imc_data),
                          is_new=False)

@patient_bp.route('/patient/<int:patient_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para editar este paciente.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    if request.method == 'POST':
        patient.name = request.form.get('name')
        patient.email = request.form.get('email', '')
        patient.phone = request.form.get('phone', '')
        birthday_str = request.form.get('birthday', '')
        patient.gender = request.form.get('gender', '')
        
        # Validações básicas
        if not patient.name:
            flash('O nome do paciente é obrigatório.', 'danger')
            return redirect(url_for('patient.edit_patient', patient_id=patient_id))
            
        if patient.email and not validate_email(patient.email):
            flash('E-mail inválido.', 'danger')
            return redirect(url_for('patient.edit_patient', patient_id=patient_id))
        
        # Converter data
        patient.birthday = format_date(birthday_str) if birthday_str else None
        
        db.session.commit()
        
        flash('Dados do paciente atualizados com sucesso!', 'success')
        return redirect(url_for('patient.patient_detail', patient_id=patient_id))
    
    return render_template('patient_detail.html', patient=patient, is_new=False, is_edit=True)

@patient_bp.route('/patient/<int:patient_id>/delete', methods=['POST'])
@login_required
def delete_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para excluir este paciente.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    db.session.delete(patient)
    db.session.commit()
    
    flash('Paciente excluído com sucesso.', 'success')
    return redirect(url_for('patient.patients_list'))

@patient_bp.route('/patient/<int:patient_id>/measurement/add', methods=['POST'])
@login_required
def add_measurement(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para adicionar medidas a este paciente.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    date_str = request.form.get('date')
    weight = request.form.get('weight')
    height = request.form.get('height')
    waist = request.form.get('waist')
    hip = request.form.get('hip')
    body_fat = request.form.get('body_fat')
    
    # Validações
    if not weight or not height:
        flash('Peso e altura são obrigatórios.', 'danger')
        return redirect(url_for('patient.patient_detail', patient_id=patient_id))
    
    # Converter valores
    try:
        date = format_date(date_str) if date_str else datetime.now().date()
        weight = float(weight)
        height = float(height)
        waist = float(waist) if waist else None
        hip = float(hip) if hip else None
        body_fat = float(body_fat) if body_fat else None
    except ValueError:
        flash('Valores inválidos. Verifique os dados informados.', 'danger')
        return redirect(url_for('patient.patient_detail', patient_id=patient_id))
    
    # Criar medição
    measurement = Measurement(
        date=date,
        weight=weight,
        height=height,
        waist=waist,
        hip=hip,
        body_fat=body_fat,
        patient_id=patient_id
    )
    
    db.session.add(measurement)
    db.session.commit()
    
    flash('Medidas registradas com sucesso!', 'success')
    return redirect(url_for('patient.patient_detail', patient_id=patient_id))

# Rotas de Planos Alimentares
@meal_bp.route('/patient/<int:patient_id>/meal-plan/add', methods=['GET', 'POST'])
@login_required
def add_meal_plan(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para criar planos para este paciente.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    if request.method == 'POST':
        title = request.form.get('title')
        start_date_str = request.form.get('start_date')
        end_date_str = request.form.get('end_date', '')
        total_calories = request.form.get('total_calories')
        notes = request.form.get('notes', '')
        
        # Validações
        if not title or not start_date_str or not total_calories:
            flash('Título, data de início e calorias totais são obrigatórios.', 'danger')
            return redirect(url_for('meal.add_meal_plan', patient_id=patient_id))
        
        # Converter valores
        try:
            start_date = format_date(start_date_str)
            end_date = format_date(end_date_str) if end_date_str else None
            total_calories = int(total_calories)
        except (ValueError, TypeError):
            flash('Valores inválidos. Verifique os dados informados.', 'danger')
            return redirect(url_for('meal.add_meal_plan', patient_id=patient_id))
        
        # Criar plano alimentar
        meal_plan = MealPlan(
            title=title,
            start_date=start_date,
            end_date=end_date,
            total_calories=total_calories,
            notes=notes,
            patient_id=patient_id
        )
        
        db.session.add(meal_plan)
        db.session.commit()
        
        flash('Plano alimentar criado com sucesso!', 'success')
        return redirect(url_for('meal.meal_plan_detail', plan_id=meal_plan.id))
    
    # Obter última medição para cálculos
    last_measurement = Measurement.query.filter_by(patient_id=patient_id).order_by(desc(Measurement.date)).first()
    
    return render_template('meal_plan.html', 
                          patient=patient, 
                          meal_plan=None, 
                          last_measurement=last_measurement,
                          is_new=True)

@meal_bp.route('/meal-plan/<int:plan_id>')
@login_required
def meal_plan_detail(plan_id):
    meal_plan = MealPlan.query.get_or_404(plan_id)
    patient = Patient.query.get_or_404(meal_plan.patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para acessar este plano alimentar.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    # Obter refeições do plano
    meals = Meal.query.filter_by(meal_plan_id=plan_id).order_by(Meal.id).all()
    
    # Calcular macros baseado nas calorias do plano
    macros = calculate_macros(meal_plan.total_calories) if meal_plan.total_calories else None
    
    return render_template('meal_plan.html', 
                          patient=patient, 
                          meal_plan=meal_plan,
                          meals=meals,
                          macros=macros,
                          is_new=False)

@meal_bp.route('/meal-plan/<int:plan_id>/add-meal', methods=['POST'])
@login_required
def add_meal(plan_id):
    meal_plan = MealPlan.query.get_or_404(plan_id)
    patient = Patient.query.get_or_404(meal_plan.patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para adicionar refeições a este plano.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    name = request.form.get('name')
    time = request.form.get('time', '')
    description = request.form.get('description', '')
    calories = request.form.get('calories', '')
    proteins = request.form.get('proteins', '')
    carbs = request.form.get('carbs', '')
    fats = request.form.get('fats', '')
    
    # Validações
    if not name or not description:
        flash('Nome e descrição da refeição são obrigatórios.', 'danger')
        return redirect(url_for('meal.meal_plan_detail', plan_id=plan_id))
    
    # Converter valores
    try:
        calories = int(calories) if calories else None
        proteins = float(proteins) if proteins else None
        carbs = float(carbs) if carbs else None
        fats = float(fats) if fats else None
    except ValueError:
        flash('Valores inválidos. Verifique os dados informados.', 'danger')
        return redirect(url_for('meal.meal_plan_detail', plan_id=plan_id))
    
    # Criar refeição
    meal = Meal(
        name=name,
        time=time,
        description=description,
        calories=calories,
        proteins=proteins,
        carbs=carbs,
        fats=fats,
        meal_plan_id=plan_id
    )
    
    db.session.add(meal)
    db.session.commit()
    
    flash('Refeição adicionada com sucesso!', 'success')
    return redirect(url_for('meal.meal_plan_detail', plan_id=plan_id))

@meal_bp.route('/meal/<int:meal_id>/delete', methods=['POST'])
@login_required
def delete_meal(meal_id):
    meal = Meal.query.get_or_404(meal_id)
    meal_plan = MealPlan.query.get_or_404(meal.meal_plan_id)
    patient = Patient.query.get_or_404(meal_plan.patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para excluir esta refeição.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    db.session.delete(meal)
    db.session.commit()
    
    flash('Refeição excluída com sucesso.', 'success')
    return redirect(url_for('meal.meal_plan_detail', plan_id=meal.meal_plan_id))

@meal_bp.route('/meal-plan/<int:plan_id>/delete', methods=['POST'])
@login_required
def delete_meal_plan(plan_id):
    meal_plan = MealPlan.query.get_or_404(plan_id)
    patient = Patient.query.get_or_404(meal_plan.patient_id)
    
    # Verificar se o paciente pertence ao usuário logado
    if patient.user_id != session.get('user_id'):
        flash('Você não tem permissão para excluir este plano alimentar.', 'danger')
        return redirect(url_for('patient.patients_list'))
    
    db.session.delete(meal_plan)
    db.session.commit()
    
    flash('Plano alimentar excluído com sucesso.', 'success')
    return redirect(url_for('patient.patient_detail', patient_id=patient.id))

# APIs para AJAX
@main.route('/api/energy-needs', methods=['POST'])
@login_required
def calculate_energy_needs_api():
    tmb = request.json.get('tmb')
    activity_level = request.json.get('activity_level')
    
    if not tmb or not activity_level:
        return jsonify({'error': 'Parâmetros inválidos'}), 400
    
    try:
        tmb = float(tmb)
        energy_needs = calculate_energy_needs(tmb, activity_level)
        return jsonify({'energy_needs': energy_needs})
    except (ValueError, TypeError):
        return jsonify({'error': 'Valores inválidos'}), 400

@main.route('/api/macros', methods=['POST'])
@login_required
def calculate_macros_api():
    total_calories = request.json.get('total_calories')
    protein_pct = request.json.get('protein_pct', 0.25)
    fat_pct = request.json.get('fat_pct', 0.25)
    
    if not total_calories:
        return jsonify({'error': 'Calorias totais são obrigatórias'}), 400
    
    try:
        total_calories = int(total_calories)
        protein_pct = float(protein_pct)
        fat_pct = float(fat_pct)
        
        macros = calculate_macros(total_calories, protein_pct, fat_pct)
        return jsonify(macros)
    except (ValueError, TypeError):
        return jsonify({'error': 'Valores inválidos'}), 400
