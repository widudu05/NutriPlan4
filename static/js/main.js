/**
 * NutriPlan - Script principal
 * Contém funções gerais para a aplicação
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o menu mobile
    initMobileMenu();
    
    // Inicializar sistema de tabs
    initTabs();
    
    // Inicializar handlers de alertas
    initAlertHandlers();
    
    // Inicializar dropdowns
    initDropdowns();
    
    // Inicializar máscaras de formulário
    initFormMasks();
});

/**
 * Inicializa o menu mobile
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Fechar menu quando clicar fora dele
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.header')) {
                navMenu.classList.remove('active');
            }
        });
    }
}

/**
 * Inicializa o sistema de tabs
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remover classe active de todas as tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Adicionar classe active na tab clicada
                this.classList.add('active');
                
                // Obter o conteúdo relacionado a esta tab
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.querySelectorAll('.tab-content');
                
                // Esconder todos os conteúdos
                tabContent.forEach(content => content.classList.remove('active'));
                
                // Mostrar o conteúdo relacionado
                const activeContent = document.getElementById(tabId);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }
}

/**
 * Inicializa os handlers para alertas
 */
function initAlertHandlers() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Adicionar botão de fechar se não existir
        if (!alert.querySelector('.close-alert')) {
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'close-alert';
            closeBtn.style.float = 'right';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.marginLeft = '10px';
            
            closeBtn.addEventListener('click', function() {
                alert.style.display = 'none';
            });
            
            alert.insertBefore(closeBtn, alert.firstChild);
        }
        
        // Auto-fechar alertas após 5 segundos (exceto alertas de erro)
        if (!alert.classList.contains('alert-danger')) {
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }
    });
}

/**
 * Inicializa dropdowns
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (trigger && menu) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                menu.classList.toggle('active');
            });
            
            // Fechar dropdown quando clicar fora
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    menu.classList.remove('active');
                }
            });
        }
    });
}

/**
 * Inicializa máscaras de formulário
 */
function initFormMasks() {
    // Máscara para telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                // Formatar como (00) 00000-0000
                if (value.length <= 11) {
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                }
            }
            
            e.target.value = value;
        });
    });
    
    // Máscara para datas
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Ao focar, exibir o seletor de data
        input.addEventListener('focus', function() {
            this.showPicker();
        });
    });
}

/**
 * Confirmação de exclusão
 * @param {string} message - Mensagem de confirmação
 * @returns {boolean} - true se confirmado, false caso contrário
 */
function confirmDelete(message = 'Tem certeza que deseja excluir este item?') {
    return confirm(message);
}

/**
 * Formata um número como peso (kg)
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatWeight(value) {
    if (!value && value !== 0) return '-';
    return `${value} kg`;
}

/**
 * Formata um número como altura (cm)
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatHeight(value) {
    if (!value && value !== 0) return '-';
    return `${value} cm`;
}

/**
 * Formata um número como porcentagem
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatPercent(value) {
    if (!value && value !== 0) return '-';
    return `${value}%`;
}

/**
 * Formata uma data para exibição
 * @param {string} dateStr - Data em formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Cálculo de IMC
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @returns {number} - IMC calculado
 */
function calculateIMC(weight, height) {
    if (!weight || !height) return null;
    
    const heightM = height / 100; // Converter cm para m
    return weight / (heightM * heightM);
}

/**
 * Obtém a classificação do IMC
 * @param {number} imc - Valor do IMC
 * @returns {string} - Classificação do IMC
 */
function getIMCClassification(imc) {
    if (!imc) return 'Não calculado';
    
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade Grau I';
    if (imc < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
}

/**
 * Calcula a Taxa Metabólica Basal (fórmula de Harris-Benedict)
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @param {number} age - Idade em anos
 * @param {string} gender - Gênero ('Masculino' ou 'Feminino')
 * @returns {number} - TMB calculada
 */
function calculateTMB(weight, height, age, gender) {
    if (!weight || !height || !age || !gender) return null;
    
    if (gender.toLowerCase() === 'masculino') {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
}

/**
 * Calcula necessidades energéticas baseado na TMB e nível de atividade
 * @param {number} tmb - Taxa Metabólica Basal
 * @param {string} activityLevel - Nível de atividade
 * @returns {number} - Necessidades energéticas
 */
function calculateEnergyNeeds(tmb, activityLevel) {
    if (!tmb || !activityLevel) return null;
    
    const factors = {
        'sedentary': 1.2,     // pouca ou nenhuma atividade
        'light': 1.375,       // exercício leve (1-3 dias por semana)
        'moderate': 1.55,     // exercício moderado (3-5 dias por semana)
        'active': 1.725,      // exercício intenso (6-7 dias por semana)
        'very_active': 1.9    // exercício muito intenso ou trabalho físico
    };
    
    const factor = factors[activityLevel] || 1.2; // default para sedentário
    return Math.round(tmb * factor);
}

/**
 * Calcula macronutrientes baseado em calorias totais
 * @param {number} totalCalories - Total de calorias
 * @param {number} proteinPct - Porcentagem de proteínas (0-1)
 * @param {number} fatPct - Porcentagem de gorduras (0-1)
 * @returns {Object} - Objeto com macronutrientes
 */
function calculateMacros(totalCalories, proteinPct = 0.25, fatPct = 0.25) {
    if (!totalCalories) return null;
    
    // Calorias por grama
    const proteinCalPerG = 4;
    const carbCalPerG = 4;
    const fatCalPerG = 9;
    
    // Calorias para cada macronutriente
    const proteinCals = totalCalories * proteinPct;
    const fatCals = totalCalories * fatPct;
    const carbCals = totalCalories - proteinCals - fatCals;
    
    // Converter para gramas
    const proteinG = Math.round(proteinCals / proteinCalPerG);
    const fatG = Math.round(fatCals / fatCalPerG);
    const carbG = Math.round(carbCals / carbCalPerG);
    
    return {
        protein: proteinG,
        carbs: carbG,
        fat: fatG
    };
}
