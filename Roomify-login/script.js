// Toggle between Sign In and Sign Up forms
const signInToggle = document.getElementById('signInToggle');
const signUpToggle = document.getElementById('signUpToggle');
const signInFormContainer = document.getElementById('signInFormContainer');
const signUpFormContainer = document.getElementById('signUpFormContainer');

signInToggle.addEventListener('click', function() {
    signInToggle.classList.add('active');
    signUpToggle.classList.remove('active');
    signInFormContainer.classList.add('active');
    signUpFormContainer.classList.remove('active');
});

signUpToggle.addEventListener('click', function() {
    signUpToggle.classList.add('active');
    signInToggle.classList.remove('active');
    signUpFormContainer.classList.add('active');
    signInFormContainer.classList.remove('active');
});

// Sign In Form Handler
document.getElementById('signInForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    // Here you would typically send this to your backend
    console.log('Sign In attempt:', { email, password });
    alert('Sign In attempt with email: ' + email);
    
    // In a real application, you would make an API call here
    // Example: fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
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
document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const phone = document.getElementById('signUpPhone').value.trim();
    const country = document.getElementById('signUpCountry').value;
    const password = document.getElementById('signUpPassword').value;
    
    // Validate name
    if (name.length < 2) {
        alert('Please enter your full name (at least 2 characters)');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate phone number (basic validation - at least 10 digits)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
        alert('Please enter a valid phone number (at least 10 digits)');
        return;
    }
    
    // Validate country
    if (!country) {
        alert('Please select your country');
        return;
    }
    
    // Validate password length (8+ characters)
    if (password.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }
    
    // Here you would typically send this to your backend
    const userData = {
        name,
        email,
        phone,
        country,
        password
    };
    
    console.log('Sign Up attempt:', userData);
    alert('Account creation attempt for: ' + name + ' (' + email + ')');
    
    // In a real application, you would make an API call here
    // Example: fetch('/api/register', { 
    //     method: 'POST', 
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(userData) 
    // })
});

// Social Login Buttons
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const title = this.getAttribute('title');
        console.log(title + ' clicked');
        alert(title + ' clicked');
    });
});
