# Login/Registration Documentation

## File: `index.html`

### Structure Overview
The login page has 3 main sections:

1. **Header** (lines 12-21) - Logo and help icon
2. **Main Content** (lines 23-120) - Form container
3. **Form Toggle** (lines 25-28) - Switch between Sign In/Register

### Form Sections

#### Sign In Form (lines 31-46)
```html
- Email address input (type="email", required)
- Password input (type="password", required)
- Sign In button
```

#### Registration Form (lines 49-80)
```html
- First Name (required)
- Last Name (required)
- Email address (type="email", required)
- Phone Number (type="tel", required)
- Password (type="password", required)
- Confirm Password (type="password", required)
- Register button
```

### Key HTML Elements

#### Form Toggle (lines 25-28)
```html
<button class="toggle-btn active" id="signInToggle">Sign In</button>
<button class="toggle-btn" id="signUpToggle">Register</button>
```
- Two buttons to switch forms
- Active state styling

#### Form Containers
- `signInFormContainer` - Sign In form (active by default)
- `signUpFormContainer` - Registration form (hidden by default)

### External Dependencies
- Bootstrap 5.3.2 (CDN)
- Font Awesome 6.4.2 (CDN)

---

## File: `style.css`

### Background Design
```css
body::before {
    /* Travel image background */
    background-image: url('unsplash-image.jpg');
    z-index: -2;
}

body::after {
    /* Blue overlay */
    background-color: rgba(0, 53, 128, 0.4);
    z-index: -1;
}
```
- Background image via ::before pseudo-element
- Blue overlay via ::after pseudo-element
- 40% opacity overlay

### Key Styles

#### Header (lines 38-88)
- Primary color background (#003580)
- White logo
- Help icon button with hover effect

#### Main Content (lines 90-97)
- Centered with flexbox
- Full viewport height minus header

#### Sign-in Container (lines 99-110)
- White background
- Rounded corners (12px)
- Shadow for depth
- Max width: 450px

#### Form Toggle (lines 112-140)
- Two buttons side by side
- Active state: Blue background, white text
- Inactive state: Transparent background, blue text
- Smooth transition

#### Form Containers (lines 142-150)
- Hidden by default (display: none)
- Active class shows form (display: block)

#### Form Fields (lines 152-180)
- Bootstrap styling
- Focus: Blue border
- Full width inputs

#### Submit Button (lines 182-200)
- Primary color background
- White text
- Full width
- Hover: Darker blue
- Disabled: Reduced opacity

### Responsive Design
- Mobile: Full width with padding
- Desktop: Centered, max 450px width

---

## File: `script.js`

### Main Functionality

#### 1. DOM Elements (lines 1-6)
```javascript
const signInToggle = document.getElementById('signInToggle');
const signUpToggle = document.getElementById('signUpToggle');
const signInFormContainer = document.getElementById('signInFormContainer');
const signUpFormContainer = document.getElementById('signUpFormContainer');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
```

#### 2. Form Toggle (lines 8-25)
```javascript
// Sign In button click
signInToggle.addEventListener('click', () => {
    // Remove active from Register button
    // Add active to Sign In button
    // Hide Register form
    // Show Sign In form
});

// Register button click
signUpToggle.addEventListener('click', () => {
    // Remove active from Sign In button
    // Add active to Register button
    // Hide Sign In form
    // Show Register form
});
```

#### 3. Sign In Form Submission (lines 27-50)
```javascript
signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get email and password
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    // Validate
    if (email && password) {
        // Show success message
        // Reset form
    } else {
        // Show error message
    }
});
```

#### 4. Registration Form Submission (lines 52-95)
```javascript
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get all form values
    const firstName = document.getElementById('signUpFirstName').value;
    const lastName = document.getElementById('signUpLastName').value;
    const email = document.getElementById('signUpEmail').value;
    const phone = document.getElementById('signUpPhone').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    
    // Validate all fields
    // Check password match
    // Validate email format
    // Show success/error message
});
```

#### 5. Email Validation (lines 97-101)
```javascript
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```
- Regex pattern for email validation
- Checks for @ symbol and domain

#### 6. Password Match Validation (lines 103-107)
```javascript
if (password !== confirmPassword) {
    alert('Passwords do not match. Please try again.');
    return;
}
```
- Compares password and confirm password
- Shows alert if mismatch

#### 7. Success Message (lines 109-125)
```javascript
function showSuccessMessage(message) {
    // Create alert element
    // Add Bootstrap classes
    // Insert before form
    // Auto-remove after 3 seconds
}
```

#### 8. Error Message (lines 127-143)
```javascript
function showErrorMessage(message) {
    // Create alert element
    // Add Bootstrap danger classes
    // Insert before form
    // Auto-remove after 3 seconds
}
```

---

## Key Features Explained

### 1. Form Toggle
- Click "Sign In" → Shows Sign In form
- Click "Register" → Shows Registration form
- Active button highlighted in blue
- Smooth transition between forms

### 2. Form Validation

#### Sign In:
- Email required
- Password required
- Basic validation

#### Registration:
- All fields required
- Email format validation
- Password match validation
- Phone number validation

### 3. Success/Error Messages
- Bootstrap alert components
- Auto-dismiss after 3 seconds
- Positioned above form

### 4. Form Reset
- Clears all fields after successful submission
- Ready for next use

---

## Study Checklist

### Before Presenting:
- [ ] Understand form toggle mechanism
- [ ] Know validation rules
- [ ] Understand email validation regex
- [ ] Know password match logic
- [ ] Understand success/error flow
- [ ] Know how to switch between forms

### Key Points to Remember:
1. **Two Forms**: Sign In and Registration
2. **Toggle**: Button click switches forms
3. **Validation**: Email format, password match
4. **Messages**: Success/error alerts
5. **Background**: Travel image with blue overlay
6. **Responsive**: Centered on all screens

### Common Questions:
- **Q: Are credentials saved?** A: No, this is frontend-only. No authentication.
- **Q: How to add real auth?** A: Connect to backend API for login/registration.
- **Q: Password security?** A: Currently plain text. In production, hash passwords.
- **Q: Can forms be pre-filled?** A: Yes, set input values programmatically.

---

## Code Highlights

### Form Toggle Logic
```javascript
signInToggle.addEventListener('click', () => {
    signInToggle.classList.add('active');
    signUpToggle.classList.remove('active');
    signInFormContainer.classList.add('active');
    signUpFormContainer.classList.remove('active');
});
```
- Toggles active classes
- Shows/hides form containers

### Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```
- Checks for characters before @
- Checks for @ symbol
- Checks for domain with dot
- Checks for extension

### Password Match
```javascript
if (password !== confirmPassword) {
    alert('Passwords do not match. Please try again.');
    return;
}
```
- Simple string comparison
- Prevents submission if mismatch

### Success Message
```javascript
const alertDiv = document.createElement('div');
alertDiv.className = 'alert alert-success alert-dismissible fade show';
alertDiv.innerHTML = `
    <strong>Success!</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
`;
```
- Creates Bootstrap alert
- Auto-dismisses after 3 seconds

---

## Integration Guide

### To Use on Other Pages:

1. **Copy HTML structure**
2. **Copy CSS styles**
3. **Copy JavaScript functionality**
4. **Link Bootstrap and Font Awesome**

### Customization:
- Change background image URL
- Modify overlay opacity
- Adjust form width
- Change color scheme

---

**Ready to present!** 🎯

