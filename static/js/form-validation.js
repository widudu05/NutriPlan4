/**
 * NutriPlan - Validação de Formulários
 * Contém funções para validação de formulários
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar validação para todos os formulários com a classe needs-validation
    initFormValidation();
});

/**
 * Inicializa a validação de formulários
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(this)) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
        
        // Validar campos durante digitação
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Para campos de senha, validar durante digitação
            if (input.type === 'password') {
                input.addEventListener('input', function() {
                    validatePasswordStrength(this);
                });
            }
        });
    });
}

/**
 * Valida um formulário inteiro
 * @param {HTMLFormElement} form - Formulário a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Validações específicas para o tipo de formulário
    if (form.getAttribute('id') === 'registerForm') {
        isValid = validateRegisterForm(form) && isValid;
    } else if (form.getAttribute('id') === 'patientForm') {
        isValid = validatePatientForm(form) && isValid;
    } else if (form.getAttribute('id') === 'measurementForm') {
        isValid = validateMeasurementForm(form) && isValid;
    } else if (form.getAttribute('id') === 'mealPlanForm') {
        isValid = validateMealPlanForm(form) && isValid;
    }
    
    return isValid;
}

/**
 * Valida um campo específico
 * @param {HTMLElement} field - Campo a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
function validateField(field) {
    let isValid = true;
    const errorElement = field.nextElementSibling;
    let errorMessage = '';
    
    // Validação para campo obrigatório
    if (field.hasAttribute('required') && field.value.trim() === '') {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }
    
    // Validação para email
    if (field.type === 'email' && field.value.trim() !== '') {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'E-mail inválido';
        }
    }
    
    // Validação para número
    if (field.type === 'number' && field.value !== '') {
        const min = field.hasAttribute('min') ? parseFloat(field.getAttribute('min')) : null;
        const max = field.hasAttribute('max') ? parseFloat(field.getAttribute('max')) : null;
        const value = parseFloat(field.value);
        
        if (isNaN(value)) {
            isValid = false;
            errorMessage = 'Valor numérico inválido';
        } else if (min !== null && value < min) {
            isValid = false;
            errorMessage = `Valor mínimo é ${min}`;
        } else if (max !== null && value > max) {
            isValid = false;
            errorMessage = `Valor máximo é ${max}`;
        }
    }
    
    // Validação para data
    if (field.type === 'date' && field.value !== '') {
        const dateValue = new Date(field.value);
        if (isNaN(dateValue.getTime())) {
            isValid = false;
            errorMessage = 'Data inválida';
        }
    }
    
    // Validação para senha
    if (field.type === 'password' && field.value !== '') {
        if (field.value.length < 8) {
            isValid = false;
            errorMessage = 'A senha deve ter pelo menos 8 caracteres';
        }
    }
    
    // Validação para padrão (pattern)
    if (field.hasAttribute('pattern') && field.value !== '') {
        const pattern = new RegExp(field.getAttribute('pattern'));
        if (!pattern.test(field.value)) {
            isValid = false;
            errorMessage = field.getAttribute('data-pattern-message') || 'Formato inválido';
        }
    }
    
    // Exibir ou esconder mensagem de erro
    if (errorElement && errorElement.classList.contains('invalid-feedback')) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = isValid ? 'none' : 'block';
    }
    
    // Adicionar ou remover classes de validação
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

/**
 * Valida a força da senha e exibe feedback
 * @param {HTMLInputElement} passwordField - Campo de senha
 */
function validatePasswordStrength(passwordField) {
    const password = passwordField.value;
    const strengthMeter = document.getElementById('passwordStrength');
    
    if (!strengthMeter) return;
    
    // Critérios de força
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    let strength = 0;
    if (hasUpperCase) strength += 1;
    if (hasLowerCase) strength += 1;
    if (hasNumbers) strength += 1;
    if (hasSpecialChars) strength += 1;
    if (isLongEnough) strength += 1;
    
    // Atualizar o medidor de força
    strengthMeter.value = strength;
    
    // Feedback visual
    if (strength < 2) {
        strengthMeter.classList.remove('medium', 'strong');
        strengthMeter.classList.add('weak');
    } else if (strength < 4) {
        strengthMeter.classList.remove('weak', 'strong');
        strengthMeter.classList.add('medium');
    } else {
        strengthMeter.classList.remove('weak', 'medium');
        strengthMeter.classList.add('strong');
    }
    
    // Atualizar texto de feedback
    const feedbackElement = document.getElementById('passwordFeedback');
    if (feedbackElement) {
        if (strength < 2) {
            feedbackElement.textContent = 'Senha fraca';
            feedbackElement.className = 'text-danger';
        } else if (strength < 4) {
            feedbackElement.textContent = 'Senha média';
            feedbackElement.className = 'text-warning';
        } else {
            feedbackElement.textContent = 'Senha forte';
            feedbackElement.className = 'text-success';
        }
    }
}

/**
 * Valida o formulário de registro
 * @param {HTMLFormElement} form - Formulário de registro
 * @returns {boolean} - true se válido, false caso contrário
 */
function validateRegisterForm(form) {
    let isValid = true;
    
    // Validar se as senhas coincidem
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirm_password');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        const errorElement = confirmPassword.nextElementSibling;
        if (errorElement && errorElement.classList.contains('invalid-feedback')) {
            errorElement.textContent = 'As senhas não coincidem';
            errorElement.style.display = 'block';
        }
        
        confirmPassword.classList.remove('is-valid');
        confirmPassword.classList.add('is-invalid');
        
        isValid = false;
    }
    
    return isValid;
}

/**
 * Valida o formulário de paciente
 * @param {HTMLFormElement} form - Formulário de paciente
 * @returns {boolean} - true se válido, false caso contrário
 */
function validatePatientForm(form) {
    let isValid = true;
    
    // Verificar se o email está em formato válido (se preenchido)
    const email = form.querySelector('#email');
    if (email && email.value.trim() !== '') {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.value)) {
            const errorElement = email.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'E-mail inválido';
                errorElement.style.display = 'block';
            }
            
            email.classList.remove('is-valid');
            email.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    // Verificar se a data de nascimento é válida e não está no futuro
    const birthday = form.querySelector('#birthday');
    if (birthday && birthday.value.trim() !== '') {
        const birthdayDate = new Date(birthday.value);
        const today = new Date();
        
        if (birthdayDate > today) {
            const errorElement = birthday.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'A data de nascimento não pode ser no futuro';
                errorElement.style.display = 'block';
            }
            
            birthday.classList.remove('is-valid');
            birthday.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Valida o formulário de medidas
 * @param {HTMLFormElement} form - Formulário de medidas
 * @returns {boolean} - true se válido, false caso contrário
 */
function validateMeasurementForm(form) {
    let isValid = true;
    
    // Verificar se o peso é válido (maior que zero)
    const weight = form.querySelector('#weight');
    if (weight && weight.value.trim() !== '') {
        const weightValue = parseFloat(weight.value);
        if (isNaN(weightValue) || weightValue <= 0) {
            const errorElement = weight.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'Peso deve ser maior que zero';
                errorElement.style.display = 'block';
            }
            
            weight.classList.remove('is-valid');
            weight.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    // Verificar se a altura é válida (maior que zero)
    const height = form.querySelector('#height');
    if (height && height.value.trim() !== '') {
        const heightValue = parseFloat(height.value);
        if (isNaN(heightValue) || heightValue <= 0) {
            const errorElement = height.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'Altura deve ser maior que zero';
                errorElement.style.display = 'block';
            }
            
            height.classList.remove('is-valid');
            height.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Valida o formulário de plano alimentar
 * @param {HTMLFormElement} form - Formulário de plano alimentar
 * @returns {boolean} - true se válido, false caso contrário
 */
function validateMealPlanForm(form) {
    let isValid = true;
    
    // Verificar se a data de início é válida e não está no passado
    const startDate = form.querySelector('#start_date');
    if (startDate && startDate.value.trim() !== '') {
        const startDateValue = new Date(startDate.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDateValue < today) {
            const errorElement = startDate.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'A data de início não pode ser no passado';
                errorElement.style.display = 'block';
            }
            
            startDate.classList.remove('is-valid');
            startDate.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    // Verificar se a data de término é posterior à data de início
    const endDate = form.querySelector('#end_date');
    if (endDate && endDate.value.trim() !== '' && startDate && startDate.value.trim() !== '') {
        const startDateValue = new Date(startDate.value);
        const endDateValue = new Date(endDate.value);
        
        if (endDateValue < startDateValue) {
            const errorElement = endDate.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'A data de término deve ser posterior à data de início';
                errorElement.style.display = 'block';
            }
            
            endDate.classList.remove('is-valid');
            endDate.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    // Verificar se as calorias totais são válidas (maior que zero)
    const totalCalories = form.querySelector('#total_calories');
    if (totalCalories && totalCalories.value.trim() !== '') {
        const caloriesValue = parseInt(totalCalories.value);
        if (isNaN(caloriesValue) || caloriesValue <= 0) {
            const errorElement = totalCalories.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = 'Calorias totais devem ser maior que zero';
                errorElement.style.display = 'block';
            }
            
            totalCalories.classList.remove('is-valid');
            totalCalories.classList.add('is-invalid');
            
            isValid = false;
        }
    }
    
    return isValid;
}
