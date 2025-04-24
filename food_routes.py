from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from models import db, Food, FoodCategory, MealItem, Meal
from utils import login_required
import math

# Criar um blueprint para as rotas de alimentos
food_bp = Blueprint('food', __name__, url_prefix='/food')

@food_bp.route('/foods')
@login_required
def foods_list():
    """Lista todos os alimentos da tabela TACO"""
    # Parâmetros de paginação
    page = request.args.get('page', 1, type=int)
    per_page = 25  # Quantidade de itens por página
    
    # Parâmetros de filtragem
    search = request.args.get('search', '')
    category_id = request.args.get('category', None, type=int)
    
    # Consulta base
    query = Food.query
    
    # Aplicar filtros
    if search:
        query = query.filter(Food.name.ilike(f'%{search}%'))
    if category_id:
        query = query.filter(Food.category_id == category_id)
    
    # Ordenar por nome
    query = query.order_by(Food.name)
    
    # Paginar resultados
    foods_pagination = query.paginate(page=page, per_page=per_page)
    
    # Obter categorias para o filtro
    categories = FoodCategory.query.order_by(FoodCategory.name).all()
    
    return render_template(
        'foods/foods.html',
        foods=foods_pagination.items,
        pagination=foods_pagination,
        search=search,
        category_id=category_id,
        categories=categories
    )

@food_bp.route('/food/<int:food_id>')
@login_required
def food_detail(food_id):
    """Detalhes de um alimento específico"""
    food = Food.query.get_or_404(food_id)
    return render_template('foods/food_detail.html', food=food)

@food_bp.route('/categories')
@login_required
def categories_list():
    """Lista todas as categorias de alimentos"""
    categories = FoodCategory.query.order_by(FoodCategory.name).all()
    return render_template('foods/categories.html', categories=categories)

@food_bp.route('/category/<int:category_id>')
@login_required
def category_detail(category_id):
    """Detalhes de uma categoria específica e seus alimentos"""
    category = FoodCategory.query.get_or_404(category_id)
    foods = Food.query.filter_by(category_id=category_id).order_by(Food.name).all()
    return render_template('foods/category_detail.html', category=category, foods=foods)

@food_bp.route('/api/search')
@login_required
def search_foods():
    """API para busca de alimentos (usado em AJAX)"""
    search = request.args.get('query', '')
    category_id = request.args.get('category', None, type=int)
    
    query = Food.query
    
    if search:
        query = query.filter(Food.name.ilike(f'%{search}%'))
    if category_id:
        query = query.filter(Food.category_id == category_id)
    
    foods = query.order_by(Food.name).limit(50).all()
    
    results = [{
        'id': food.id,
        'name': food.name,
        'category_name': food.category.name,
        'calories': food.calories,
        'proteins': food.proteins,
        'carbs': food.carbs,
        'fats': food.fats
    } for food in foods]
    
    return jsonify({'foods': results})

@food_bp.route('/api/food/<int:food_id>')
@login_required
def get_food_data(food_id):
    """API para obter dados de um alimento específico"""
    food = Food.query.get_or_404(food_id)
    
    result = {
        'food': {
            'id': food.id,
            'name': food.name,
            'category_name': food.category.name,
            'calories': food.calories,
            'proteins': food.proteins,
            'carbs': food.carbs,
            'fats': food.fats,
            'fiber': food.fiber,
            'sodium': food.sodium,
            'calcium': food.calcium,
            'iron': food.iron,
            'cholesterol': food.cholesterol
        }
    }
    
    return jsonify(result)

@food_bp.route('/meal/<int:meal_id>/add_item', methods=['GET', 'POST'])
@login_required
def add_meal_item(meal_id):
    """Adiciona um item de alimento a uma refeição"""
    # GET: exibe o formulário para adicionar alimento
    if request.method == 'GET':
        meal = Meal.query.get_or_404(meal_id)
        meal_plan = meal.meal_plan
        
        # Obter categorias para o filtro
        categories = FoodCategory.query.order_by(FoodCategory.name).all()
        
        # Obter os itens já adicionados à refeição
        meal_items = MealItem.query.filter_by(meal_id=meal_id).all()
        
        # Calcular totais
        total_calories = sum(item.calories for item in meal_items) if meal_items else 0
        total_proteins = sum(item.proteins for item in meal_items) if meal_items else 0
        total_carbs = sum(item.carbs for item in meal_items) if meal_items else 0
        total_fats = sum(item.fats for item in meal_items) if meal_items else 0
        
        return render_template(
            'foods/add_meal_item.html',
            meal=meal,
            meal_plan=meal_plan,
            categories=categories,
            meal_items=meal_items,
            total_calories=total_calories,
            total_proteins=total_proteins,
            total_carbs=total_carbs,
            total_fats=total_fats
        )
    
    # POST: processa a adição do alimento
    meal = Meal.query.get_or_404(meal_id)
    
    food_id = request.form.get('food_id', type=int)
    quantity = request.form.get('quantity', type=float)
    
    if not food_id or not quantity:
        flash('Selecione um alimento e informe a quantidade.', 'danger')
        return redirect(url_for('meal.meal_detail', meal_id=meal_id))
    
    food = Food.query.get_or_404(food_id)
    
    # Calcular nutrientes com base na quantidade
    factor = quantity / 100
    calories = round(food.calories * factor, 2) if food.calories else 0
    proteins = round(food.proteins * factor, 2) if food.proteins else 0
    carbs = round(food.carbs * factor, 2) if food.carbs else 0
    fats = round(food.fats * factor, 2) if food.fats else 0
    
    # Criar novo item de refeição
    meal_item = MealItem(
        quantity=quantity,
        food_id=food_id,
        meal_id=meal_id,
        calories=calories,
        proteins=proteins,
        carbs=carbs,
        fats=fats
    )
    
    db.session.add(meal_item)
    
    # Recalcular totais da refeição
    meal.calculate_totals()
    
    # Recalcular totais do plano alimentar
    meal.meal_plan.calculate_totals()
    
    db.session.commit()
    
    flash(f'{food.name} adicionado à refeição com sucesso!', 'success')
    return redirect(url_for('meal.meal_detail', meal_id=meal_id))

@food_bp.route('/meal_item/<int:item_id>/delete', methods=['POST'])
@login_required
def delete_meal_item(item_id):
    """Remove um item de alimento de uma refeição"""
    meal_item = MealItem.query.get_or_404(item_id)
    meal_id = meal_item.meal_id
    meal = Meal.query.get(meal_id)
    
    db.session.delete(meal_item)
    
    # Recalcular totais da refeição
    meal.calculate_totals()
    
    # Recalcular totais do plano alimentar
    meal.meal_plan.calculate_totals()
    
    db.session.commit()
    
    flash('Item removido com sucesso!', 'success')
    return redirect(url_for('meal.meal_detail', meal_id=meal_id))

@food_bp.route('/import_taco')
@login_required
def import_taco():
    """Página para importar dados da tabela TACO"""
    # Verificar se já existem alimentos no banco
    food_count = Food.query.count()
    category_count = FoodCategory.query.count()
    
    return render_template(
        'foods/import_taco.html',
        food_count=food_count,
        category_count=category_count
    )

@food_bp.route('/process_taco', methods=['POST'])
@login_required
def process_taco():
    """Processa os dados da tabela TACO e insere no banco de dados"""
    # Importar a função de processamento
    from process_taco import process_taco_data
    
    try:
        # Chamar o processamento
        food_count = process_taco_data()
        
        if food_count > 0:
            flash(f'{food_count} alimentos da tabela TACO foram importados com sucesso!', 'success')
        else:
            flash('Nenhum alimento foi importado. Verifique o arquivo TACO.xlsx.', 'warning')
            
    except Exception as e:
        flash(f'Erro ao processar tabela TACO: {str(e)}', 'danger')
    
    return redirect(url_for('food.foods_list'))