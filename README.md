# NutriPlan 4.0 - Sistema para Nutricionistas

NutriPlan é um sistema web completo desenvolvido para nutricionistas gerenciarem seus pacientes, avaliações antropométricas, planos alimentares e consultas de forma eficiente e intuitiva.

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

## Melhorias Implementadas na Versão 4.0

1. **Sistema de Consultas Completo:**
   - Registro detalhado de consultas nutricionais
   - Sistema de sub-abas para diferentes aspectos da avaliação
   - Histórico completo de atendimentos
   - Suporte a formatação Markdown para melhor visualização

2. **Interface Responsiva:**
   - Adaptação completa para dispositivos móveis
   - Layout otimizado para todos os tamanhos de tela
   - Utilização de DataTables para melhor visualização de dados

3. **Usabilidade Aprimorada:**
   - Sistema de abas para organizar informações
   - Filtros e busca em tabelas
   - Validação de formulários em tempo real
   - Feedbacks visuais para ações do usuário

4. **Recursos de Cálculo:**
   - Calculadora de necessidades energéticas baseada no nível de atividade
   - Ajuste automático para objetivos (perda de peso, manutenção, ganho de massa)
   - Distribuição personalizada de macronutrientes

5. **Visualização de Dados:**
   - Gráficos interativos para acompanhamento da evolução do paciente
   - Visualização de distribuição de macronutrientes
   - Indicadores visuais de status (cores e ícones)

6. **Organização da Estrutura do Código:**
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
git clone https://github.com/widudu05/NutriPlan4.git
cd NutriPlan4
```

2. Instale as dependências:
```bash
pip install flask flask-sqlalchemy markdown markupsafe openpyxl pandas sqlalchemy werkzeug
```

3. Execute a aplicação:
```bash
python app.py
```

4. Acesse a aplicação em seu navegador:
```
http://localhost:5000
```

## Credenciais de Acesso

Para acessar o sistema, utilize as seguintes credenciais:

**Usuário:** admin  
**Senha:** Admin123

## Documentação Técnica

Para mais detalhes sobre a implementação, arquitetura e funcionamento técnico do sistema, consulte o arquivo [DOCUMENTATION.md](DOCUMENTATION.md).

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
3. Faça commit das mudanças: `git commit -am 'Adiciona nova funcionalidade'`
4. Envie para o seu fork: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
