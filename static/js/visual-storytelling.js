/**
 * NutriPlan - Storytelling Visual
 * Este módulo adiciona elementos visuais narrativos aos relatórios nutricionais
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initVisualStorytelling();
});

/**
 * Inicializa todos os elementos de storytelling visual
 */
function initVisualStorytelling() {
    // Criar jornada de progresso se o elemento existir
    const progressJourneyContainer = document.getElementById('progressJourney');
    if (progressJourneyContainer) {
        const weightData = JSON.parse(progressJourneyContainer.getAttribute('data-values') || '[]');
        if (weightData.length > 0) {
            createProgressJourney(progressJourneyContainer, weightData);
        }
    }
    
    // Criar narrativa nutricional se o elemento existir
    const nutritionalStoryContainer = document.getElementById('nutritionalStory');
    if (nutritionalStoryContainer) {
        const macrosData = {
            protein: parseFloat(nutritionalStoryContainer.getAttribute('data-protein') || '0'),
            carbs: parseFloat(nutritionalStoryContainer.getAttribute('data-carbs') || '0'),
            fat: parseFloat(nutritionalStoryContainer.getAttribute('data-fat') || '0'),
            goal: nutritionalStoryContainer.getAttribute('data-goal') || 'manutenção'
        };
        
        if (macrosData.protein > 0 || macrosData.carbs > 0 || macrosData.fat > 0) {
            createNutritionalStory(nutritionalStoryContainer, macrosData);
        }
    }
    
    // Criar narrativa sobre macronutrientes de uma refeição
    const macroNarrativeContainer = document.getElementById('macroNarrative');
    if (macroNarrativeContainer) {
        const macroData = {
            protein: parseFloat(macroNarrativeContainer.getAttribute('data-protein') || '0'),
            carbs: parseFloat(macroNarrativeContainer.getAttribute('data-carbs') || '0'),
            fat: parseFloat(macroNarrativeContainer.getAttribute('data-fat') || '0'),
            mealType: macroNarrativeContainer.getAttribute('data-meal-type') || ''
        };
        
        if (macroData.protein > 0 || macroData.carbs > 0 || macroData.fat > 0) {
            createMacroNarrative(macroNarrativeContainer, macroData);
        }
    }
    
    // Criar narrativa de objetivo se o elemento existir
    const goalNarrativeContainer = document.getElementById('goalNarrative');
    if (goalNarrativeContainer) {
        const goalData = {
            current: parseFloat(goalNarrativeContainer.getAttribute('data-current') || '0'),
            target: parseFloat(goalNarrativeContainer.getAttribute('data-target') || '0'),
            metric: goalNarrativeContainer.getAttribute('data-metric') || 'peso',
            duration: parseInt(goalNarrativeContainer.getAttribute('data-duration') || '0')
        };
        
        if (goalData.current > 0 && goalData.target > 0) {
            createGoalNarrative(goalNarrativeContainer, goalData);
        }
    }
    
    // Atualizar todos os ícones motivacionais
    updateMotivationalIcons();
}

/**
 * Cria uma narrativa visual da jornada de progresso do paciente
 * @param {HTMLElement} container - Elemento HTML que conterá a narrativa
 * @param {Array} data - Array de objetos com data e valor da medida
 */
function createProgressJourney(container, data) {
    // Garantir que os dados estejam em ordem cronológica
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calcular diferença entre primeiro e último valor
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const difference = lastValue - firstValue;
    const percentChange = ((difference / firstValue) * 100).toFixed(1);
    const isPositive = difference > 0;
    const isNegative = difference < 0;
    
    // Determinar o tema baseado na direção da mudança
    let theme = 'neutral';
    let icon = '🔄';
    let message = 'Mantendo estabilidade';
    
    if (data[0].metric === 'peso') {
        if (isNegative) {
            theme = 'success';
            icon = '🏆';
            message = 'Perda de peso em progresso';
        } else if (isPositive) {
            theme = 'warning';
            icon = '📈';
            message = 'Ganho de peso observado';
        }
    } else if (data[0].metric === 'imc') {
        if (lastValue < 25 && firstValue >= 25) {
            theme = 'success';
            icon = '🌟';
            message = 'IMC normalizado!';
        } else if (lastValue < 30 && firstValue >= 30) {
            theme = 'success';
            icon = '👏';
            message = 'Saindo da obesidade';
        } else if (isNegative) {
            theme = 'info';
            icon = '📉';
            message = 'IMC em redução';
        }
    }
    
    // Criar elementos da jornada
    let journeyHTML = `
        <div class="journey-narrative ${theme}">
            <div class="journey-icon">${icon}</div>
            <div class="journey-content">
                <h4>${message}</h4>
                <div class="journey-metrics">
                    <div class="journey-metric">
                        <span>Inicial:</span>
                        <strong>${firstValue.toFixed(1)}</strong>
                    </div>
                    <div class="journey-arrow">
                        <i class="fas ${isNegative ? 'fa-arrow-down' : isPositive ? 'fa-arrow-up' : 'fa-arrows-h'}"></i>
                        <span>${Math.abs(difference).toFixed(1)} (${isNegative ? '-' : isPositive ? '+' : ''}${Math.abs(percentChange)}%)</span>
                    </div>
                    <div class="journey-metric">
                        <span>Atual:</span>
                        <strong>${lastValue.toFixed(1)}</strong>
                    </div>
                </div>
            </div>
        </div>
        <div class="journey-timeline">
    `;
    
    // Adicionar marcos na jornada (no máximo 5 para não sobrecarregar)
    const displayPoints = data.length <= 5 ? data : selectKeyPoints(data, 5);
    
    displayPoints.forEach((point, index) => {
        const isFirst = index === 0;
        const isLast = index === displayPoints.length - 1;
        const pointClass = isFirst ? 'start' : isLast ? 'end' : '';
        
        journeyHTML += `
            <div class="journey-point ${pointClass}">
                <div class="journey-point-date">${formatDateShort(point.date)}</div>
                <div class="journey-point-marker"></div>
                <div class="journey-point-value">${point.value.toFixed(1)}</div>
            </div>
        `;
        
        // Adicionar linha entre pontos (exceto após o último)
        if (!isLast) {
            journeyHTML += `<div class="journey-line"></div>`;
        }
    });
    
    journeyHTML += `</div>`;
    
    // Adicionar mensagem motivacional baseada no progresso
    journeyHTML += `
        <div class="journey-motivation">
            ${getMotivationalMessage(data[0].metric, difference, percentChange)}
        </div>
    `;
    
    // Inserir conteúdo no container
    container.innerHTML = journeyHTML;
    
    // Adicionar classes CSS
    container.classList.add('visual-journey-container');
}

/**
 * Cria uma narrativa visual para os macronutrientes e plano alimentar
 * @param {HTMLElement} container - Elemento HTML que conterá a narrativa
 * @param {Object} data - Objeto com valores de proteínas, carboidratos, gorduras e objetivo
 */
function createNutritionalStory(container, data) {
    // Calcular totais e porcentagens
    const totalProteina = data.protein * 4; // 4 calorias por grama
    const totalCarbs = data.carbs * 4;     // 4 calorias por grama
    const totalGordura = data.fat * 9;     // 9 calorias por grama
    const totalCalorias = totalProteina + totalCarbs + totalGordura;
    
    const pctProteina = Math.round((totalProteina / totalCalorias) * 100);
    const pctCarbs = Math.round((totalCarbs / totalCalorias) * 100);
    const pctGordura = Math.round((totalGordura / totalCalorias) * 100);
    
    // Determinar tema e personagem baseado no objetivo
    let character = '🏃';
    let title = 'Plano de Manutenção';
    let description = 'Este plano é equilibrado para manter sua saúde e peso atuais.';
    
    if (data.goal.includes('perda') || data.goal.includes('emagrecimento')) {
        character = '🥗';
        title = 'Plano de Emagrecimento';
        description = 'Combinação de nutrientes para promover perda de peso saudável.';
    } else if (data.goal.includes('ganho') || data.goal.includes('massa')) {
        character = '💪';
        title = 'Plano de Ganho de Massa';
        description = 'Foco em proteínas e energia para desenvolver massa muscular.';
    } else if (data.goal.includes('saúde') || data.goal.includes('saude')) {
        character = '❤️';
        title = 'Plano para Saúde';
        description = 'Nutrientes balanceados para melhorar seus indicadores de saúde.';
    }
    
    // Avaliar composição e adicionar insights
    let insights = '';
    
    if (pctProteina > 30) {
        insights += `<li>Alta em proteínas (${pctProteina}%), ideal para recuperação muscular e saciedade</li>`;
    }
    
    if (pctCarbs > 50) {
        insights += `<li>Rica em carboidratos (${pctCarbs}%), ótima fonte de energia para atividades físicas</li>`;
    } else if (pctCarbs < 30) {
        insights += `<li>Baixa em carboidratos (${pctCarbs}%), ajuda a controlar os níveis de insulina</li>`;
    }
    
    if (pctGordura > 35) {
        insights += `<li>Teor elevado de gorduras boas (${pctGordura}%), importante para hormônios e células</li>`;
    }
    
    // Criar visualização da narrativa
    let storyHTML = `
        <div class="nutritional-story">
            <div class="story-header">
                <div class="story-character">${character}</div>
                <div class="story-title">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
            </div>
            
            <div class="story-macros-visual">
                <div class="macro-bar">
                    <div class="macro-segment protein" style="width: ${pctProteina}%;" title="Proteínas: ${pctProteina}%">
                        ${pctProteina}%
                    </div>
                    <div class="macro-segment carbs" style="width: ${pctCarbs}%;" title="Carboidratos: ${pctCarbs}%">
                        ${pctCarbs}%
                    </div>
                    <div class="macro-segment fat" style="width: ${pctGordura}%;" title="Gorduras: ${pctGordura}%">
                        ${pctGordura}%
                    </div>
                </div>
                
                <div class="macro-legend">
                    <div class="legend-item">
                        <span class="color-box protein"></span>
                        <span>Proteínas</span>
                    </div>
                    <div class="legend-item">
                        <span class="color-box carbs"></span>
                        <span>Carboidratos</span>
                    </div>
                    <div class="legend-item">
                        <span class="color-box fat"></span>
                        <span>Gorduras</span>
                    </div>
                </div>
            </div>
            
            <div class="story-insights">
                <h4>Destaques deste plano:</h4>
                <ul>
                    ${insights || '<li>Distribuição equilibrada de macronutrientes para uma alimentação balanceada</li>'}
                </ul>
            </div>
        </div>
    `;
    
    // Inserir conteúdo no container
    container.innerHTML = storyHTML;
    
    // Adicionar classes CSS
    container.classList.add('nutritional-story-container');
}

/**
 * Cria uma narrativa visual para os objetivos do paciente
 * @param {HTMLElement} container - Elemento HTML que conterá a narrativa
 * @param {Object} data - Objeto com valor atual, alvo, métrica e duração
 */
function createGoalNarrative(container, data) {
    // Calcular diferença e progresso
    const difference = data.target - data.current;
    const isReduction = difference < 0;
    const absChange = Math.abs(difference);
    const diffPerWeek = data.duration > 0 ? (absChange / (data.duration / 7)).toFixed(1) : '?';
    
    // Determinar unidade com base na métrica
    let unit = 'kg';
    if (data.metric.includes('imc')) {
        unit = 'pontos';
    } else if (data.metric.includes('gordura')) {
        unit = '%';
    }
    
    // Calcular quantas semanas já se passaram (simulado para demonstração)
    // Em uma implementação real, usaríamos a data de início do plano
    const weeksElapsed = Math.floor(Math.random() * (data.duration / 7)) + 1;
    const expectedProgress = (absChange / (data.duration / 7)) * weeksElapsed;
    const actualProgress = expectedProgress * (Math.random() * 0.5 + 0.75); // Simulando entre 75-125% do esperado
    
    // Porcentagem do progresso em direção ao objetivo
    const progressPct = Math.min(100, Math.round((actualProgress / absChange) * 100));
    
    // Obter ícone e mensagem com base no objetivo
    let icon, title, message;
    
    if (data.metric.includes('peso')) {
        if (isReduction) {
            icon = '⚖️';
            title = 'Objetivo de Emagrecimento';
            message = `Perda gradual de ${absChange} ${unit} em ${data.duration} dias`;
        } else {
            icon = '🏋️';
            title = 'Objetivo de Ganho de Peso';
            message = `Ganho gradual de ${absChange} ${unit} em ${data.duration} dias`;
        }
    } else if (data.metric.includes('imc')) {
        icon = '📊';
        title = 'Objetivo de IMC';
        message = `${isReduction ? 'Redução' : 'Aumento'} de ${absChange} pontos de IMC`;
    } else if (data.metric.includes('gordura')) {
        icon = '📉';
        title = 'Objetivo de Redução de Gordura';
        message = `Redução de ${absChange}% de gordura corporal`;
    } else {
        icon = '🎯';
        title = 'Objetivo Personalizado';
        message = `Meta de ${data.target} ${unit} em ${data.duration} dias`;
    }
    
    // Criar narrativa visual
    let goalHTML = `
        <div class="goal-narrative">
            <div class="goal-header">
                <div class="goal-icon">${icon}</div>
                <div class="goal-title">
                    <h3>${title}</h3>
                    <p>${message}</p>
                </div>
            </div>
            
            <div class="goal-journey">
                <div class="journey-points">
                    <div class="journey-point current">
                        <span class="point-label">Atual</span>
                        <strong class="point-value">${data.current} ${unit}</strong>
                    </div>
                    
                    <div class="journey-progress">
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${progressPct}%;"></div>
                        </div>
                        <div class="progress-label">${progressPct}% concluído</div>
                    </div>
                    
                    <div class="journey-point target">
                        <span class="point-label">Meta</span>
                        <strong class="point-value">${data.target} ${unit}</strong>
                    </div>
                </div>
                
                <div class="goal-details">
                    <div class="detail-item">
                        <span class="detail-label">Ritmo necessário:</span>
                        <span class="detail-value">${diffPerWeek} ${unit}/semana</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Progresso atual:</span>
                        <span class="detail-value">${actualProgress.toFixed(1)} ${unit} (${progressPct}%)</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tempo restante:</span>
                        <span class="detail-value">${data.duration - (weeksElapsed * 7)} dias</span>
                    </div>
                </div>
            </div>
            
            <div class="goal-motivation">
                ${getGoalMotivationMessage(progressPct, isReduction)}
            </div>
        </div>
    `;
    
    // Inserir conteúdo no container
    container.innerHTML = goalHTML;
    
    // Adicionar classes CSS
    container.classList.add('goal-narrative-container');
}

/**
 * Atualiza ícones motivacionais em elementos que possuem o atributo data-motivation
 */
function updateMotivationalIcons() {
    const motivationalElements = document.querySelectorAll('[data-motivation]');
    
    motivationalElements.forEach(element => {
        const motivationType = element.getAttribute('data-motivation');
        const value = parseFloat(element.getAttribute('data-value') || '0');
        const target = parseFloat(element.getAttribute('data-target') || '0');
        
        if (motivationType && value) {
            const icon = getMotivationalIcon(motivationType, value, target);
            element.innerHTML = icon + element.innerHTML;
            element.classList.add('has-motivation-icon');
        }
    });
}

/**
 * Seleciona pontos importantes em uma série de dados para criar uma narrativa visual
 * @param {Array} data - Array completo de dados
 * @param {number} count - Número de pontos a selecionar
 * @returns {Array} - Pontos selecionados
 */
function selectKeyPoints(data, count) {
    if (data.length <= count) return data;
    
    // Sempre incluir primeiro e último pontos
    const result = [data[0], data[data.length - 1]];
    
    // Se precisamos de mais pontos
    if (count > 2) {
        const remaining = count - 2;
        const step = Math.floor(data.length / (remaining + 1));
        
        for (let i = 1; i <= remaining; i++) {
            const index = i * step;
            if (index > 0 && index < data.length - 1) {
                result.push(data[index]);
            }
        }
        
        // Ordenar por data
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    return result;
}

/**
 * Formata uma data para exibição abreviada
 * @param {string} dateStr - Data em formato string
 * @returns {string} - Data formatada
 */
function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

/**
 * Gera uma mensagem motivacional baseada no progresso
 * @param {string} metric - Tipo de métrica (peso, imc, etc)
 * @param {number} change - Mudança no valor
 * @param {number} percentChange - Mudança percentual
 * @returns {string} - Mensagem motivacional HTML
 */
function getMotivationalMessage(metric, change, percentChange) {
    const messages = {
        'peso': {
            negative: [
                '🎯 Você está no caminho certo! Continue com o plano alimentar.',
                '💪 Cada pequeno passo conta! Sua dedicação está dando resultados.',
                '🌟 Progresso constante leva a resultados permanentes!',
                '🔥 Sua jornada de emagrecimento está evoluindo bem!'
            ],
            positive: [
                '📈 Vamos revisar seu plano para alinhar com seus objetivos.',
                '🍎 Pequenos ajustes na alimentação podem fazer grande diferença.',
                '🚶 Considere aumentar sua atividade física diária.',
                '💧 Não se esqueça da hidratação adequada!'
            ],
            neutral: [
                '⚖️ Estabilidade também é uma conquista! Vamos manter o foco.',
                '🧘 Equilíbrio é importante. Vamos seguir consistentes!',
                '📊 Manter o peso também requer dedicação. Parabéns!'
            ]
        },
        'imc': {
            negative: [
                '📉 Seu IMC está melhorando! Isso reflete na sua saúde.',
                '❤️ Cada ponto de IMC reduzido é uma vitória para sua saúde!',
                '🌈 Você está avançando em direção à sua faixa ideal de IMC!',
                '🏆 Continue assim! Sua saúde agradece.'
            ],
            positive: [
                '⚠️ Vamos revisar seu plano para ajustar a tendência do IMC.',
                '🥦 Foco em alimentos nutritivos pode ajudar a melhorar seu IMC.',
                '🚴 Considere incluir mais atividades físicas na sua rotina.'
            ],
            neutral: [
                '📊 Seu IMC está estável. Vamos trabalhar para otimizá-lo!',
                '🧩 Manter a consistência é o segredo para resultados duradouros.'
            ]
        }
    };
    
    // Selecionar conjunto de mensagens
    const metricType = metric.toLowerCase().includes('imc') ? 'imc' : 'peso';
    let messageType = 'neutral';
    
    if (Math.abs(percentChange) < 1) {
        messageType = 'neutral';
    } else if (change < 0) {
        messageType = 'negative';
    } else {
        messageType = 'positive';
    }
    
    // Selecionar mensagem aleatória do conjunto apropriado
    const messageSet = messages[metricType][messageType];
    const randomMessage = messageSet[Math.floor(Math.random() * messageSet.length)];
    
    return `<div class="message ${messageType}">${randomMessage}</div>`;
}

/**
 * Gera uma mensagem motivacional baseada no progresso em direção ao objetivo
 * @param {number} progressPct - Porcentagem de progresso
 * @param {boolean} isReduction - Se o objetivo é redução (ex: perda de peso)
 * @returns {string} - Mensagem motivacional HTML
 */
function getGoalMotivationMessage(progressPct, isReduction) {
    // Mensagens para objetivos de redução (ex: perda de peso)
    const reductionMessages = [
        { threshold: 0, message: '🌱 O começo de toda jornada é importante! Vamos dar os primeiros passos.' },
        { threshold: 20, message: '🚶 Você já iniciou o caminho! Continue consistente.' },
        { threshold: 40, message: '🏃 Quase na metade do percurso! Seu esforço está valendo a pena.' },
        { threshold: 60, message: '⚡ Mais da metade do caminho percorrido! Mantenha o ritmo.' },
        { threshold: 80, message: '🎯 A meta está próxima! Continue com o mesmo empenho.' },
        { threshold: 95, message: '🏆 Você está praticamente lá! Reta final!' }
    ];
    
    // Mensagens para objetivos de aumento (ex: ganho de massa)
    const increaseMessages = [
        { threshold: 0, message: '🌱 Todo grande resultado começa com pequenos passos! Vamos lá.' },
        { threshold: 20, message: '💪 Seu progresso já é visível! Continue alimentando-se bem.' },
        { threshold: 40, message: '🏋️ Você está no caminho certo! Quase na metade da jornada.' },
        { threshold: 60, message: '🔥 Mais da metade do objetivo alcançado! Mantenha a consistência.' },
        { threshold: 80, message: '⚡ A reta final está próxima! Continue com seu empenho.' },
        { threshold: 95, message: '🏆 Praticamente lá! O resultado final está ao seu alcance!' }
    ];
    
    // Selecionar mensagem apropriada
    const messageSet = isReduction ? reductionMessages : increaseMessages;
    let selectedMessage;
    
    for (let i = messageSet.length - 1; i >= 0; i--) {
        if (progressPct >= messageSet[i].threshold) {
            selectedMessage = messageSet[i].message;
            break;
        }
    }
    
    // Adicionar sugestões baseadas no progresso
    let suggestions = '';
    
    if (progressPct < 30) {
        suggestions = `
            <div class="tip">
                <i class="fas fa-lightbulb"></i>
                <span>Dica: Mantenha um registro diário do seu progresso para aumentar a motivação.</span>
            </div>
        `;
    } else if (progressPct < 70) {
        suggestions = `
            <div class="tip">
                <i class="fas fa-lightbulb"></i>
                <span>Dica: Agora é um bom momento para revisar o plano e fazer pequenos ajustes se necessário.</span>
            </div>
        `;
    } else {
        suggestions = `
            <div class="tip">
                <i class="fas fa-lightbulb"></i>
                <span>Dica: Comece a pensar no plano de manutenção para após atingir seu objetivo!</span>
            </div>
        `;
    }
    
    return `
        <div class="motivation-message">
            <div class="message">${selectedMessage}</div>
            ${suggestions}
        </div>
    `;
}

/**
 * Retorna um ícone motivacional baseado no tipo e valor
 * @param {string} type - Tipo de métrica
 * @param {number} value - Valor atual
 * @param {number} target - Valor alvo (opcional)
 * @returns {string} - HTML do ícone
 */
function getMotivationalIcon(type, value, target) {
    // Ícones padrão para diferentes tipos de métricas
    const icons = {
        'peso': {
            good: '⚖️',
            neutral: '⚖️',
            attention: '⚖️'
        },
        'imc': {
            good: '📊',
            neutral: '📊',
            attention: '⚠️'
        },
        'gordura': {
            good: '📉',
            neutral: '📊',
            attention: '📈'
        },
        'proteina': {
            good: '🥩',
            neutral: '🍗',
            attention: '🍖'
        },
        'carboidrato': {
            good: '🍚',
            neutral: '🍞',
            attention: '🍰'
        },
        'gorduras': {
            good: '🥑',
            neutral: '🧈',
            attention: '🍔'
        }
    };
    
    // Determinar status baseado no valor e/ou alvo
    let status = 'neutral';
    
    if (type === 'imc') {
        if (value < 18.5) status = 'attention'; // Abaixo do peso
        else if (value >= 18.5 && value < 25) status = 'good'; // Normal
        else if (value >= 25 && value < 30) status = 'neutral'; // Sobrepeso
        else status = 'attention'; // Obesidade
    } else if (type === 'peso' && target > 0) {
        // Se temos um valor alvo para comparar
        const diff = Math.abs(value - target);
        const pct = (diff / target) * 100;
        
        if (pct < 5) status = 'good'; // Dentro de 5% do alvo
        else if (pct < 15) status = 'neutral'; // Dentro de 15% do alvo
        else status = 'attention'; // Mais de 15% de diferença
    }
    
    // Selecionar ícone apropriado
    const category = type.toLowerCase().replace(' ', '');
    const iconSet = icons[category] || icons['peso']; // Fallback para peso
    const icon = iconSet[status] || '📋'; // Fallback genérico
    
    return `<span class="motivation-icon ${status}">${icon}</span>`;
}

/**
 * Cria uma narrativa visual para os macronutrientes de uma refeição
 * @param {HTMLElement} container - Elemento que conterá a narrativa
 * @param {Object} data - Dados dos macronutrientes e tipo de refeição
 */
function createMacroNarrative(container, data) {
    // Calcular totais e porcentagens
    const totalProteina = data.protein * 4; // 4 calorias por grama
    const totalCarbs = data.carbs * 4;     // 4 calorias por grama
    const totalGordura = data.fat * 9;     // 9 calorias por grama
    const totalCalorias = totalProteina + totalCarbs + totalGordura;
    
    const pctProteina = Math.round((totalProteina / totalCalorias) * 100) || 0;
    const pctCarbs = Math.round((totalCarbs / totalCalorias) * 100) || 0;
    const pctGordura = Math.round((totalGordura / totalCalorias) * 100) || 0;
    
    // Determinar o tipo de refeição e recomendações específicas
    let mealTitle = "Distribuição de Macronutrientes";
    let mealRecommendations = [];
    
    // Identificar o tipo de refeição a partir do nome
    const mealTypeLower = data.mealType.toLowerCase();
    
    // Café da manhã
    if (mealTypeLower.includes('café') || mealTypeLower.includes('cafe') || mealTypeLower.includes('manhã')) {
        mealTitle = "Café da Manhã";
        
        // Recomendações com base na distribuição
        if (pctCarbs > 60) {
            mealRecommendations.push({
                text: "Alto teor de carboidratos pode causar pico de insulina. Considere adicionar mais proteínas para maior saciedade.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        }
        
        if (pctProteina < 15) {
            mealRecommendations.push({
                text: "Aumentar a proteína no café da manhã pode melhorar a saciedade e reduzir lanches durante a manhã.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        }
        
        if (pctProteina >= 20 && pctCarbs >= 40 && pctGordura <= 30) {
            mealRecommendations.push({
                text: "Ótimo equilíbrio de nutrientes para iniciar o dia com energia sustentada.",
                icon: "fa-check-circle",
                type: "success"
            });
        }
    }
    // Almoço
    else if (mealTypeLower.includes('almoço') || mealTypeLower.includes('almoco')) {
        mealTitle = "Almoço";
        
        if (pctProteina < 20) {
            mealRecommendations.push({
                text: "Considere aumentar a proteína no almoço para melhor recuperação muscular e energia para o restante do dia.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        }
        
        if (pctCarbs > 55 && pctProteina < 20) {
            mealRecommendations.push({
                text: "Alta quantidade de carboidratos pode causar sonolência após o almoço. Equilibre com mais proteínas.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        }
        
        if (pctProteina >= 25 && pctCarbs <= 50 && pctGordura >= 15) {
            mealRecommendations.push({
                text: "Excelente composição para uma refeição principal, proporcionando energia sustentada.",
                icon: "fa-check-circle",
                type: "success"
            });
        }
    }
    // Jantar
    else if (mealTypeLower.includes('jantar') || mealTypeLower.includes('noite')) {
        mealTitle = "Jantar";
        
        if (pctCarbs > 50) {
            mealRecommendations.push({
                text: "Reduzir carboidratos no jantar pode melhorar a qualidade do sono e o metabolismo noturno.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        }
        
        if (pctProteina >= 30 && pctCarbs <= 40) {
            mealRecommendations.push({
                text: "Boa proporção de proteínas e redução de carboidratos, ideal para o período noturno.",
                icon: "fa-check-circle",
                type: "success"
            });
        }
    }
    // Lanche
    else if (mealTypeLower.includes('lanche')) {
        mealTitle = "Lanche";
        
        if (pctGordura > 40) {
            mealRecommendations.push({
                text: "Lanches com alto teor de gordura podem ser mais calóricos. Equilibre com proteínas para maior saciedade.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        }
        
        if (pctProteina >= 25 && pctGordura <= 30) {
            mealRecommendations.push({
                text: "Lanche rico em proteínas, excelente para recuperação muscular e controle da fome.",
                icon: "fa-check-circle",
                type: "success"
            });
        }
    }
    
    // Adicionar uma recomendação padrão se não houver nenhuma específica
    if (mealRecommendations.length === 0) {
        if (pctProteina < 15) {
            mealRecommendations.push({
                text: "Considere aumentar o consumo de proteínas para maior saciedade e manutenção muscular.",
                icon: "fa-lightbulb",
                type: "warning"
            });
        } else if (pctProteina >= 20 && pctCarbs >= 30 && pctGordura >= 15) {
            mealRecommendations.push({
                text: "Boa distribuição de macronutrientes, fornecendo energia e nutrientes de forma equilibrada.",
                icon: "fa-check-circle",
                type: "success"
            });
        }
    }
    
    // Construir a narrativa HTML
    let narrativeHTML = `
        <div class="macro-narrative-container">
            <h4>${mealTitle}: Análise Nutricional</h4>
            <p>Esta refeição possui ${pctProteina}% de proteínas, ${pctCarbs}% de carboidratos e ${pctGordura}% de gorduras.</p>
            
            <div class="macro-recommendations">
    `;
    
    // Adicionar recomendações
    mealRecommendations.forEach(rec => {
        narrativeHTML += `
            <div class="macro-recommendation ${rec.type}">
                <i class="fas ${rec.icon}"></i>
                <div>${rec.text}</div>
            </div>
        `;
    });
    
    narrativeHTML += `
            </div>
        </div>
    `;
    
    // Inserir HTML no container
    container.innerHTML = narrativeHTML;
}

/**
 * Cria uma narrativa visual para o objetivo do paciente
 * @param {HTMLElement} container - Elemento onde a narrativa será exibida
 * @param {Object} data - Dados para a narrativa (atual, meta, métrica, duração)
 */
function createGoalNarrative(container, data) {
    const { current, target, metric, duration } = data;
    const isWeightLoss = target < current;
    const difference = Math.abs(target - current);
    const percentChange = (Math.abs(target - current) / current * 100).toFixed(1);
    
    // Variáveis para personalizar a narrativa
    let title, description, colorClass, ratePerWeek;
    
    if (isWeightLoss) {
        title = "Perda de Peso";
        colorClass = "success";
        ratePerWeek = (difference / (duration / 7)).toFixed(1);
        description = `Meta de redução de ${difference.toFixed(1)} kg (${percentChange}%) em ${duration} dias, equivalente a ${ratePerWeek} kg por semana.`;
    } else {
        title = "Ganho de Peso";
        colorClass = "warning";
        ratePerWeek = (difference / (duration / 7)).toFixed(1);
        description = `Meta de aumento de ${difference.toFixed(1)} kg (${percentChange}%) em ${duration} dias, equivalente a ${ratePerWeek} kg por semana.`;
    }
    
    const progressPercent = Math.min(100, Math.max(0, 10)); // Valor inicial de 10%
    
    // Criar elementos HTML
    const goalHTML = `
        <div class="goal-narrative-container ${colorClass}">
            <h4 class="goal-title">${title}</h4>
            <p class="goal-description">${description}</p>
            
            <div class="journey-points">
                <div class="journey-point current">
                    <div class="journey-point-label">Atual</div>
                    <div class="journey-point-value">${current.toFixed(1)} kg</div>
                </div>
                
                <div class="journey-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        <div class="progress-marker" style="left: ${progressPercent}%">
                            <div class="marker-label">Hoje</div>
                        </div>
                    </div>
                </div>
                
                <div class="journey-point target">
                    <div class="journey-point-label">Meta</div>
                    <div class="journey-point-value">${target.toFixed(1)} kg</div>
                </div>
            </div>
            
            <div class="goal-details">
                <div class="goal-detail">
                    <span class="detail-label">Duração</span>
                    <span class="detail-value">${duration} dias</span>
                </div>
                <div class="goal-detail">
                    <span class="detail-label">Ritmo</span>
                    <span class="detail-value">${ratePerWeek} kg/semana</span>
                </div>
                <div class="goal-detail">
                    <span class="detail-label">Diferença</span>
                    <span class="detail-value">${difference.toFixed(1)} kg</span>
                </div>
                <div class="goal-detail">
                    <span class="detail-label">Variação</span>
                    <span class="detail-value">${percentChange}%</span>
                </div>
            </div>
            
            <div class="goal-motivation">
                <div class="motivation-message">
                    <div class="message">Você está no caminho certo!</div>
                    <div class="tip">
                        <i class="fas fa-lightbulb"></i>
                        ${isWeightLoss ? 
                            "Mantenha o déficit calórico e priorize proteínas para preservar massa muscular." : 
                            "Mantenha o superávit calórico moderado e priorize proteínas para ganho de massa muscular."}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inserir HTML no container
    container.innerHTML = goalHTML;
}