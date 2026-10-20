// Toggle between Sign In and Sign Up forms
const signInToggle = document.getElementById('signInToggle');
const signUpToggle = document.getElementById('signUpToggle');
const signInFormContainer = document.getElementById('signInFormContainer');
const signUpFormContainer = document.getElementById('signUpFormContainer');

// Function to switch to Register tab
function switchToRegisterTab() {
    signUpToggle.classList.add('active');
    signInToggle.classList.remove('active');
    signUpFormContainer.classList.add('active');
    signInFormContainer.classList.remove('active');
}

// Function to switch to Sign In tab
function switchToSignInTab() {
    signInToggle.classList.add('active');
    signUpToggle.classList.remove('active');
    signInFormContainer.classList.add('active');
    signUpFormContainer.classList.remove('active');
}

// Check URL parameter on page load
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') !== null || window.location.hash === '#register') {
        switchToRegisterTab();
    }
});

signInToggle.addEventListener('click', function() {
    switchToSignInTab();
});

signUpToggle.addEventListener('click', function() {
    switchToRegisterTab();
});

// Sign In Form Handler
document.getElementById('signInForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    const submitButton = this.querySelector('button[type="submit"]');
    
    // Basic validation
    if (!email || !password) {
        showErrorMessage('Please fill in all required fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorMessage('Please enter a valid email address');
        return;
    }
    
    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing in...';
    
    // Make API call to backend
    try {
        const response = await api.login(email, password);
        
        // Show success message
        showSuccessMessage('Login successful! Redirecting...');
        
        // Redirect to homepage after short delay
        setTimeout(() => {
            window.location.href = '../Home Page/index.html';
        }, 1000);
    } catch (error) {
        showErrorMessage(error.message || 'Login failed. Please check your credentials and try again.');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Password Toggle Functionality
function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(toggleId);
    
    if (passwordInput && toggleButton) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = toggleButton.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
}

// Setup password toggles
setupPasswordToggle('signUpPassword', 'toggleSignUpPassword');

// Sign Up Form Handler
document.getElementById('signUpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const phone = document.getElementById('signUpPhone').value.trim();
    const country = document.getElementById('signUpCountry').value;
    const password = document.getElementById('signUpPassword').value;
    const submitButton = this.querySelector('button[type="submit"]');
    
    // Validate name
    if (name.length < 2) {
        showErrorMessage('Please enter your full name (at least 2 characters)');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorMessage('Please enter a valid email address');
        return;
    }
    
    // Validate phone number (basic validation - at least 10 digits)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
        showErrorMessage('Please enter a valid phone number (at least 10 digits)');
        return;
    }
    
    // Validate country
    if (!country) {
        showErrorMessage('Please select your country');
        return;
    }
    
    // Validate password length (8+ characters)
    if (password.length < 8) {
        showErrorMessage('Password must be at least 8 characters long!');
        return;
    }
    
    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating account...';
    
    // Make API call to backend
    try {
        const response = await api.register(name, email, password, phone, country);
        
        // Ensure token is present (camelCase or PascalCase)
        const token = response?.token ?? response?.Token;
        if (!token) {
            showErrorMessage('Registration succeeded but no token was returned.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        // Show success message
        showSuccessMessage('Account created successfully! Redirecting...');
        
        // Redirect to homepage after short delay
        setTimeout(() => {
            window.location.href = '../Home Page/index.html';
        }, 1000);
    } catch (error) {
        showErrorMessage(error.message || 'Registration failed. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Success Message Function
function showSuccessMessage(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'auth-message auth-message-success';
    messageDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of the form container
    const activeForm = document.querySelector('.form-container.active');
    activeForm.insertBefore(messageDiv, activeForm.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Error Message Function
function showErrorMessage(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create error message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'auth-message auth-message-error';
    messageDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of the form container
    const activeForm = document.querySelector('.form-container.active');
    activeForm.insertBefore(messageDiv, activeForm.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Social Login Buttons
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const title = this.getAttribute('title');
        
        // Show loading state
        const icon = this.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'fas fa-spinner fa-spin';
        this.disabled = true;
        
        // Simulate social login (replace with actual OAuth flow in production)
        setTimeout(() => {
            // Store user session for demo
            const userData = {
                email: 'social@example.com',
                isLoggedIn: true,
                loginTime: new Date().toISOString(),
                loginMethod: title.replace('Continue with ', '').toLowerCase()
            };
            localStorage.setItem('roomifyUser', JSON.stringify(userData));
            
            showSuccessMessage('Login successful! Redirecting...');
            
            // Redirect to homepage
            setTimeout(() => {
                window.location.href = '../Home Page/index.html';
            }, 1000);
        }, 1000);
    });
});
