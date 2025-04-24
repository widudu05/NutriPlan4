# NutriPlan 2.0 - Sistema para Nutricionistas

NutriPlan é um sistema web desenvolvido para nutricionistas gerenciarem seus pacientes, avaliações antropométricas e planos alimentares de forma eficiente e intuitiva.

## Funcionalidades

- **Gerenciamento de Pacientes:**
  - Cadastro completo de pacientes com dados pessoais
  - Visualização e busca de pacientes
  - Histórico de acompanhamento

- **Avaliações Antropométricas:**
  - Registro de medidas (peso, altura, circunferências)
  - Cálculo automático de IMC e classificação
  - Cálculo de TMB (Taxa Metabólica Basal)
  - Gráficos de evolução

- **Planos Alimentares:**
  - Criação de planos personalizados
  - Cálculo automático de necessidades energéticas
  - Distribuição de macronutrientes
  - Organização por refeições

- **Dashboard:**
  - Estatísticas gerais
  - Visualização de pacientes recentes
  - Gráficos de acompanhamento

## Melhorias Implementadas na Versão 2.0

1. **Interface Responsiva:**
   - Adaptação completa para dispositivos móveis
   - Layout otimizado para todos os tamanhos de tela

2. **Usabilidade Aprimorada:**
   - Sistema de abas para organizar informações
   - Filtros e busca em tabelas
   - Validação de formulários em tempo real
   - Feedbacks visuais para ações do usuário

3. **Recursos de Cálculo:**
   - Calculadora de necessidades energéticas baseada no nível de atividade
   - Ajuste automático para objetivos (perda de peso, manutenção, ganho de massa)
   - Distribuição personalizada de macronutrientes

4. **Visualização de Dados:**
   - Gráficos interativos para acompanhamento da evolução do paciente
   - Visualização de distribuição de macronutrientes
   - Indicadores visuais de status (cores e ícones)

5. **Organização da Estrutura do Código:**
   - Separação clara de responsabilidades (MVC)
   - Código comentado para facilitar manutenção
   - Módulos reutilizáveis para funcionalidades comuns

## Tecnologias Utilizadas

- **Backend:**
  - Python 3.x
  - Flask (framework web)
  - SQLAlchemy (ORM)
  - SQLite (banco de dados)

- **Frontend:**
  - HTML5, CSS3, JavaScript
  - Chart.js (para gráficos)
  - Fonte Awesome (para ícones)
  - Google Fonts (Roboto)

## Instalação e Execução

### Pré-requisitos
- Python 3.x
- pip (gerenciador de pacotes do Python)

### Passos para instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/nutriplan2.git
cd nutriplan2
