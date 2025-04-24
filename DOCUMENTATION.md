# Documentação Técnica do NutriPlan

## Visão Geral

NutriPlan é um sistema web completo para gerenciamento nutricional, projetado para auxiliar nutricionistas no atendimento e acompanhamento de pacientes. O sistema permite o cadastro e gerenciamento de pacientes, registros de medidas antropométricas, criação de planos alimentares e registro detalhado de consultas.

## Arquitetura

O sistema foi desenvolvido utilizando a arquitetura MVC (Model-View-Controller) com Flask, um microframework web para Python. A estrutura do projeto segue as seguintes divisões:

- **Models**: Definições das tabelas do banco de dados e suas relações
- **Views**: Templates HTML para renderização das páginas
- **Controllers**: Rotas e lógica de negócio implementadas no arquivo routes.py
- **Config**: Configurações da aplicação
- **Utils**: Funções auxiliares e utilitárias

## Tecnologias Utilizadas

### Backend
- Python 3.11
- Flask: Framework web
- Flask-SQLAlchemy: ORM para acesso ao banco de dados
- SQLite: Banco de dados (configurável para outros SGBDs)
- Markdown: Para formatação de textos em consultas

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 4.6: Framework CSS para design responsivo
- Font Awesome 5: Ícones
- jQuery: Biblioteca JavaScript
- Chart.js: Biblioteca para criação de gráficos
- DataTables: Plugin para tabelas interativas

## Estrutura do Banco de Dados

### Tabelas Principais

#### User
- Modelo para usuários do sistema (nutricionistas)
- Campos principais: username, email, password_hash
- Relacionamentos: patients (one-to-many)

#### Patient
- Modelo para pacientes cadastrados
- Campos principais: name, email, phone, birthday, gender
- Relacionamentos: measurements, meal_plans, consultations (one-to-many)

#### Measurement
- Modelo para medidas antropométricas
- Campos principais: date, weight, height, waist, hip, body_fat
- Métodos calculados: imc(), imc_classification(), tmb()

#### MealPlan
- Modelo para planos alimentares
- Campos principais: title, start_date, end_date, total_calories, notes
- Relacionamentos: meals (one-to-many)

#### Meal
- Modelo para refeições dentro do plano alimentar
- Campos principais: name, time, description, calories, proteins, carbs, fats

#### Consultation
- Modelo para consultas nutricionais
- Campos principais: date, next_appointment, consultation_type, status, main_complaint, objective, notes
- Relacionamentos: consultation_details (one-to-many)

#### ConsultationDetail
- Modelo para detalhes específicos da consulta (sub-abas)
- Campos principais: tab_name, data (JSON), text_data

## Rotas Principais

### Autenticação
- `/login`: Login no sistema
- `/logout`: Logout do sistema
- `/register`: Cadastro de novos usuários (nutricionistas)

### Pacientes
- `/patient/patients`: Lista de pacientes
- `/patient/patient/add`: Adicionar paciente
- `/patient/patient/<id>`: Detalhes do paciente
- `/patient/patient/<id>/edit`: Editar paciente
- `/patient/patient/<id>/delete`: Excluir paciente

### Medidas
- `/patient/patient/<id>/add_measurement`: Adicionar medida
- (Demais rotas integradas na visualização do paciente)

### Planos Alimentares
- `/patient/patient/<id>/add_meal_plan`: Adicionar plano alimentar
- `/meal/meal_plan/<id>`: Detalhes do plano alimentar
- `/meal/meal_plan/<id>/add_meal`: Adicionar refeição
- `/meal/meal/<id>/delete`: Excluir refeição
- `/meal/meal_plan/<id>/delete`: Excluir plano alimentar

### Consultas
- `/consultation/consultations`: Lista de todas as consultas
- `/consultation/patient/<id>/consultations`: Consultas de um paciente específico
- `/consultation/patient/<id>/add`: Adicionar consulta
- `/consultation/consultation/<id>`: Detalhes da consulta
- `/consultation/consultation/<id>/edit`: Editar consulta
- `/consultation/consultation/<id>/delete`: Excluir consulta
- `/consultation/consultation/<id>/add_tab`: Adicionar aba à consulta
- `/consultation/consultation_detail/<id>/edit`: Editar detalhe da consulta
- `/consultation/consultation_detail/<id>/delete`: Excluir detalhe da consulta

### APIs
- `/api/calculate_energy_needs`: Calcular necessidades energéticas
- `/api/calculate_macros`: Calcular macronutrientes

## Funcionalidades Principais

### Gestão de Pacientes
- Cadastro completo de pacientes
- Visualização em lista e detalhada
- Busca e filtragem
- Edição e exclusão

### Avaliação Antropométrica
- Registro de medidas (peso, altura, circunferências, etc.)
- Cálculo automático de IMC
- Classificação de IMC
- Cálculo de Taxa Metabólica Basal (TMB)
- Gráficos de evolução

### Planos Alimentares
- Criação de planos com período de validade
- Adição de múltiplas refeições
- Cálculo de calorias e macronutrientes
- Geração de PDF para impressão

### Consultas
- Agendamento e registro de consultas
- Diferentes tipos (primeira consulta, retorno, etc.)
- Status de consulta (agendada, realizada, cancelada)
- Sistema de sub-abas para registro detalhado:
  1. QPC (Queixa Principal do Cliente)
  2. Anamnese
  3. Marcadores bioquímicos
  4. Consumo alimentar
  5. Avaliação antropométrica
  6. Conduta
  7. Medidas
  8. Orientações
- Suporte à formatação Markdown para melhor visualização

### Dashboard
- Visão geral do sistema
- Gráficos de pacientes cadastrados
- Próximas consultas agendadas
- Estatísticas rápidas

## Segurança

- Autenticação de usuários
- Senhas criptografadas com hash
- Proteção contra SQL Injection via SQLAlchemy
- Proteção de rotas com decorador `@login_required`
- Validação de formulários no cliente e servidor

## Instalação e Configuração

### Requisitos
- Python 3.11+
- Pip (gerenciador de pacotes do Python)
- Dependências listadas no arquivo pyproject.toml

### Instalação
1. Clone o repositório: `git clone https://github.com/widudu05/NutriPlan4.git`
2. Instale as dependências: `pip install -r requirements.txt`
3. Configure as variáveis de ambiente (opcional):
   - SECRET_KEY: Chave secreta para sessões
   - DATABASE_URL: URL de conexão com o banco de dados
   - FLASK_DEBUG: Modo de depuração (True/False)
4. Inicialize o banco de dados: `flask init-db` (comando personalizado)
5. Execute a aplicação: `python app.py`
6. Acesse: `http://localhost:5000`

## Extensibilidade

O sistema foi projetado para ser facilmente estendido com novas funcionalidades. Para adicionar novos recursos:

1. Adicione modelos no arquivo models.py
2. Crie novos blueprints para organizar as rotas
3. Adicione templates na pasta templates/
4. Implemente JavaScript específico na pasta static/js/
5. Registre os blueprints no arquivo app.py

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
3. Faça commit das mudanças: `git commit -am 'Adiciona nova funcionalidade'`
4. Envie para o seu fork: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## Filtros de Template

A aplicação utiliza diversos filtros Jinja2 para melhorar a apresentação de dados nos templates:

### Filtro Markdown
Converte texto em formato Markdown para HTML, permitindo formatação avançada.
```python
@app.template_filter('markdown')
def render_markdown(text):
    if text:
        return Markup(markdown.markdown(text))
    return ""
```

### Filtro nl2br
Converte quebras de linha (\n) em tags HTML `<br>`, mantendo a formatação de texto com múltiplas linhas.
```python
@app.template_filter('nl2br')
def nl2br(text):
    if text:
        # Substituir tanto \n quanto literais \\n
        text = text.replace('\\n', '\n')  # Primeiro, converte \\n para \n
        return Markup(text.replace('\n', '<br>'))
    return ""
```

Este filtro é especialmente importante nas seguintes funcionalidades:
- Exibição de observações nos planos alimentares
- Exibição de descrições de refeições
- Exibição de notas em consultas

## Manutenção

### Backups
- Recomenda-se fazer backup do banco de dados periodicamente
- Considere usar soluções de backup automatizado

### Atualização
- Mantenha as dependências atualizadas verificando vulnerabilidades
- Siga as melhores práticas de segurança para aplicações web

## Autores

- Equipe de Desenvolvimento Replit
- Contribuidores diversos via GitHub

## Histórico de Atualizações e Correções

### Versão 1.1 (24/04/2025)
- **Correção**: Implementado filtro nl2br para processar corretamente quebras de linha nos planos alimentares e consultas
- **Melhoria**: Adicionado tratamento especial para suportar tanto quebras de linha regulares (`\n`) quanto escapadas (`\\n`)
- **Correção**: Resolvido problema ao exibir observações com múltiplas linhas em planos alimentares
- **Documentação**: Atualização da documentação técnica com informações sobre os filtros de template

### Versão 1.0 (20/03/2025)
- Lançamento inicial do sistema
- Implementação completa do CRUD de pacientes, medidas, planos alimentares e consultas
- Integração com a tabela TACO para informações nutricionais
- Implementação da autenticação de usuários

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.