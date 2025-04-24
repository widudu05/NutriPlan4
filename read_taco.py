import pandas as pd

# Carregar o arquivo TACO.xlsx
try:
    # Ler as primeiras linhas para entender a estrutura
    df = pd.read_excel('attached_assets/Taco.xlsx')
    print("Arquivo lido com sucesso!")
    
    # Exibir informações sobre a estrutura do DataFrame
    print("\nInformações do DataFrame:")
    print(f"Número de linhas: {df.shape[0]}")
    print(f"Número de colunas: {df.shape[1]}")
    
    # Exibir nomes das colunas
    print("\nNomes das colunas:")
    print(df.columns.tolist())
    
    # Exibir os primeiros 5 registros
    print("\nPrimeiros 5 registros:")
    print(df.head(5))
    
    # Verificar os primeiros 10 registros para entender a estrutura real dos dados
    print("\nPrimeiras 10 linhas para análise:")
    for idx, row in df.iloc[0:10].iterrows():
        print(f"Linha {idx}:")
        for col in df.columns:
            print(f"  {col}: {row[col]}")
        print("-" * 50)
    
    # Analisar valores nulos
    print("\nContagem de valores nulos por coluna:")
    print(df.isna().sum())
    
    # Obter valores únicos da coluna Tipo (suponho que é 'Unnamed: 0')
    print("\nCategorias de alimentos (valores únicos na coluna 'Unnamed: 0'):")
    print(df['Unnamed: 0'].unique())
    
    # Tentando identificar a coluna de nomes de alimentos
    print("\nPossível coluna de nomes de alimentos (valores em 'Unnamed: 1'):")
    print(df['Unnamed: 1'].iloc[1:15].tolist())
    
    # Valores de calorias e nutrientes principais para algumas linhas
    print("\nAmostras de valores nutricionais (linhas 1-5):")
    nutrient_cols = ['Energia', 'Proteína', 'Lipídeos', 'Carboidrato']
    print(df[['Unnamed: 1'] + nutrient_cols].iloc[1:6])
    
except Exception as e:
    print(f"Erro ao ler o arquivo: {e}")