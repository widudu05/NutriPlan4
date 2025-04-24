import pandas as pd
import sqlite3
from models import db, Food, FoodCategory
from app import create_app

def process_taco_data():
    """
    Processa os dados da tabela TACO e insere no banco de dados
    """
    try:
        # Carregar o arquivo TACO.xlsx
        df = pd.read_excel('attached_assets/Taco.xlsx')
        
        # A primeira linha contém os rótulos, então vamos usá-la para renomear as colunas
        headers = {}
        for i, col in enumerate(df.columns):
            if i == 0:
                headers[col] = 'categoria'
            elif i == 1:
                headers[col] = 'id_alimento'
            elif i == 2:
                headers[col] = 'nome'
            else:
                # Use o valor da primeira linha como nome da coluna se disponível
                new_col = df.iloc[0, i]
                if pd.isna(new_col) or new_col == '':
                    headers[col] = col  # Mantém o nome original se o valor estiver vazio
                else:
                    headers[col] = new_col
        
        # Renomear as colunas
        df = df.rename(columns=headers)
        
        # Remover a primeira linha pois agora ela está nos cabeçalhos
        df = df.iloc[1:].reset_index(drop=True)
        
        # Convertendo a coluna id_alimento para string
        df['id_alimento'] = df['id_alimento'].astype(str)
        
        # Limpar os dados, substituindo 'Tr' por 0 e valores NaN por 0
        for col in df.columns:
            if col not in ['categoria', 'id_alimento', 'nome']:
                df[col] = df[col].apply(lambda x: 0 if x == 'Tr' else x)
                df[col] = df[col].fillna(0)
        
        print(f"Linhas processadas: {len(df)}")
        
        # Inicializar a aplicação Flask e o contexto
        app = create_app()
        with app.app_context():
            # Limpar tabelas existentes
            FoodCategory.query.delete()
            Food.query.delete()
            
            # Categorias únicas
            categorias = df['categoria'].unique()
            categorias_map = {}
            
            # Inserir categorias primeiro
            for categoria in categorias:
                if categoria != 'Tipo' and not pd.isna(categoria):
                    categoria_obj = FoodCategory(name=categoria)
                    db.session.add(categoria_obj)
                    db.session.flush()  # Para obter o ID
                    categorias_map[categoria] = categoria_obj.id
            
            # Inserir alimentos
            for idx, row in df.iterrows():
                categoria = row['categoria']
                if categoria in categorias_map:
                    # Obter os principais nutrientes
                    energia = row.get('Energia', 0)
                    proteina = row.get('Proteína', 0)
                    lipideos = row.get('Lipídeos', 0)
                    carboidrato = row.get('Carboidrato', 0)
                    fibra = row.get('Fibra Alimentar', 0)
                    
                    # Criar alimento
                    food = Food(
                        name=row['nome'],
                        taco_id=row['id_alimento'],
                        category_id=categorias_map[categoria],
                        calories=energia,
                        proteins=proteina,
                        carbs=carboidrato,
                        fats=lipideos,
                        fiber=fibra
                    )
                    
                    # Atribuir outros nutrientes se a coluna existir
                    if 'Sódio' in row:
                        food.sodium = row['Sódio']
                    if 'Cálcio' in row:
                        food.calcium = row['Cálcio']
                    if 'Ferro' in row:
                        food.iron = row['Ferro']
                    if 'Colesterol' in row:
                        food.cholesterol = row['Colesterol']
                    
                    db.session.add(food)
            
            db.session.commit()
            
            # Verificar quantos alimentos foram inseridos
            food_count = Food.query.count()
            category_count = FoodCategory.query.count()
            print(f"Categorias inseridas: {category_count}")
            print(f"Alimentos inseridos: {food_count}")
            
            return food_count
            
    except Exception as e:
        print(f"Erro ao processar tabela TACO: {e}")
        import traceback
        traceback.print_exc()
        return 0

if __name__ == "__main__":
    print("Iniciando processamento da tabela TACO...")
    result = process_taco_data()
    print(f"Processamento finalizado. {result} alimentos inseridos.")