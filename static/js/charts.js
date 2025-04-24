/**
 * NutriPlan - Gráficos
 * Contém funções para criação e manipulação de gráficos
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos
    initCharts();
});

/**
 * Inicializa todos os gráficos da página
 */
function initCharts() {
    // Gráfico de peso na página de detalhes do paciente
    const weightChartContainer = document.getElementById('weightChart');
    if (weightChartContainer) {
        const weightData = JSON.parse(weightChartContainer.getAttribute('data-values') || '[]');
        if (weightData.length > 0) {
            createWeightChart(weightChartContainer, weightData);
        }
    }
    
    // Gráfico de IMC na página de detalhes do paciente
    const imcChartContainer = document.getElementById('imcChart');
    if (imcChartContainer) {
        const imcData = JSON.parse(imcChartContainer.getAttribute('data-values') || '[]');
        if (imcData.length > 0) {
            createIMCChart(imcChartContainer, imcData);
        }
    }
    
    // Gráfico de pacientes por mês no dashboard
    const patientsByMonthContainer = document.getElementById('patientsByMonthChart');
    if (patientsByMonthContainer) {
        const chartData = JSON.parse(patientsByMonthContainer.getAttribute('data-values') || '[]');
        if (chartData.length > 0) {
            createPatientsByMonthChart(patientsByMonthContainer, chartData);
        }
    }
    
    // Gráfico de macronutrientes no plano alimentar
    const macrosChartContainer = document.getElementById('macrosChart');
    if (macrosChartContainer) {
        const protein = parseFloat(macrosChartContainer.getAttribute('data-protein') || '0');
        const carbs = parseFloat(macrosChartContainer.getAttribute('data-carbs') || '0');
        const fat = parseFloat(macrosChartContainer.getAttribute('data-fat') || '0');
        
        if (protein > 0 || carbs > 0 || fat > 0) {
            createMacrosChart(macrosChartContainer, protein, carbs, fat);
        }
    }
}

/**
 * Cria um gráfico de evolução do peso
 * @param {HTMLElement} container - Elemento HTML que conterá o gráfico
 * @param {Array} data - Array de objetos com data e valor do peso
 */
function createWeightChart(container, data) {
    // Extrair datas e valores
    const labels = data.map(item => item.date);
    const values = data.map(item => item.value);
    
    // Criar o gráfico
    const ctx = container.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso (kg)',
                data: values,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                pointRadius: 4,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Peso (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Peso: ${context.parsed.y} kg`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Evolução do Peso'
                }
            }
        }
    });
}

/**
 * Cria um gráfico de evolução do IMC
 * @param {HTMLElement} container - Elemento HTML que conterá o gráfico
 * @param {Array} data - Array de objetos com data e valor do IMC
 */
function createIMCChart(container, data) {
    // Extrair datas e valores
    const labels = data.map(item => item.date);
    const values = data.map(item => item.value);
    
    // Criar o gráfico
    const ctx = container.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'IMC',
                data: values,
                backgroundColor: 'rgba(3, 169, 244, 0.1)',
                borderColor: 'rgba(3, 169, 244, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(3, 169, 244, 1)',
                pointRadius: 4,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'IMC'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const imc = context.parsed.y;
                            let classification = '';
                            
                            if (imc < 18.5) classification = 'Abaixo do peso';
                            else if (imc < 25) classification = 'Peso normal';
                            else if (imc < 30) classification = 'Sobrepeso';
                            else if (imc < 35) classification = 'Obesidade Grau I';
                            else if (imc < 40) classification = 'Obesidade Grau II';
                            else classification = 'Obesidade Grau III';
                            
                            return [`IMC: ${imc.toFixed(1)}`, `Classificação: ${classification}`];
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Evolução do IMC'
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 18.5,
                            yMax: 18.5,
                            borderColor: 'rgba(255, 193, 7, 0.7)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                enabled: true,
                                content: 'Abaixo do peso',
                                position: 'start'
                            }
                        },
                        line2: {
                            type: 'line',
                            yMin: 25,
                            yMax: 25,
                            borderColor: 'rgba(255, 193, 7, 0.7)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                enabled: true,
                                content: 'Sobrepeso',
                                position: 'start'
                            }
                        },
                        line3: {
                            type: 'line',
                            yMin: 30,
                            yMax: 30,
                            borderColor: 'rgba(244, 67, 54, 0.7)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                enabled: true,
                                content: 'Obesidade',
                                position: 'start'
                            }
                        }
                    }
                }
            }
        }
    });
}

/**
 * Cria um gráfico de pacientes cadastrados por mês
 * @param {HTMLElement} container - Elemento HTML que conterá o gráfico
 * @param {Array} data - Array de objetos com mês e contagem
 */
function createPatientsByMonthChart(container, data) {
    // Extrair meses e valores
    const labels = data.map(item => item.month);
    const values = data.map(item => item.count);
    
    // Criar o gráfico
    const ctx = container.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes Cadastrados',
                data: values,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0 // Forçar inteiros
                    },
                    title: {
                        display: true,
                        text: 'Quantidade'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mês'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const count = context.parsed.y;
                            return `${count} paciente${count !== 1 ? 's' : ''}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Pacientes Cadastrados por Mês'
                }
            }
        }
    });
}

/**
 * Cria um gráfico de distribuição de macronutrientes
 * @param {HTMLElement} container - Elemento HTML que conterá o gráfico
 * @param {number} protein - Quantidade de proteínas em gramas
 * @param {number} carbs - Quantidade de carboidratos em gramas
 * @param {number} fat - Quantidade de gorduras em gramas
 */
function createMacrosChart(container, protein, carbs, fat) {
    // Converter gramas para calorias
    const proteinCal = protein * 4; // 4 calorias por grama
    const carbsCal = carbs * 4;     // 4 calorias por grama
    const fatCal = fat * 9;         // 9 calorias por grama
    
    // Calcular porcentagens
    const total = proteinCal + carbsCal + fatCal;
    const proteinPct = Math.round((proteinCal / total) * 100);
    const carbsPct = Math.round((carbsCal / total) * 100);
    const fatPct = Math.round((fatCal / total) * 100);
    
    // Criar o gráfico
    const ctx = container.getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                `Proteínas (${proteinPct}%)`,
                `Carboidratos (${carbsPct}%)`,
                `Gorduras (${fatPct}%)`
            ],
            datasets: [{
                data: [protein, carbs, fat],
                backgroundColor: [
                    'rgba(244, 67, 54, 0.7)',  // Vermelho para proteínas
                    'rgba(255, 193, 7, 0.7)',  // Amarelo para carboidratos
                    'rgba(3, 169, 244, 0.7)'   // Azul para gorduras
                ],
                borderColor: [
                    'rgba(244, 67, 54, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(3, 169, 244, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const index = context.dataIndex;
                            
                            let calValue = 0;
                            if (index === 0) calValue = value * 4;      // Proteínas
                            else if (index === 1) calValue = value * 4; // Carboidratos
                            else if (index === 2) calValue = value * 9; // Gorduras
                            
                            return `${value}g (${calValue} kcal)`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Distribuição de Macronutrientes'
                }
            }
        }
    });
}

/**
 * Cria um gráfico básico de barras
 * @param {HTMLElement} container - Elemento HTML que conterá o gráfico
 * @param {Array} labels - Array de labels para o eixo X
 * @param {Array} data - Array de dados para o eixo Y
 * @param {string} title - Título do gráfico
 * @param {string} yAxisLabel - Rótulo do eixo Y
 */
function createBarChart(container, labels, data, title, yAxisLabel) {
    const ctx = container.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

/**
 * Cria um gráfico básico de linhas
 * @param {HTMLElement} container - Elemento HTML que conterá o gráfico
 * @param {Array} labels - Array de labels para o eixo X
 * @param {Array} data - Array de dados para o eixo Y
 * @param {string} title - Título do gráfico
 * @param {string} yAxisLabel - Rótulo do eixo Y
 */
function createLineChart(container, labels, data, title, yAxisLabel) {
    const ctx = container.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(3, 169, 244, 0.1)',
                borderColor: 'rgba(3, 169, 244, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(3, 169, 244, 1)',
                pointRadius: 4,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}
