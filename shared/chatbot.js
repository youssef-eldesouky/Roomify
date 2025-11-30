// Enhanced Chatbot Component - Reusable across all pages
// Automatically detects current page and adjusts navigation paths

(function() {
    'use strict';

    // Get current page path to determine relative paths
    function getBasePath() {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(part => part && part !== '');
        
        // Remove filename
        pathParts.pop();
        
        // Count depth from root
        const depth = pathParts.length;
        
        // Determine base path
        let basePath = '';
        for (let i = 0; i < depth; i++) {
            basePath += '../';
        }
        
        return basePath || './';
    }

    // Navigation paths - adjusted based on current page location
    const basePath = getBasePath();
    
    // Determine if we're on the homepage
    const isHomePage = window.location.pathname.includes('Home Page') || 
                       window.location.pathname.includes('index.html') ||
                       (window.location.pathname.split('/').filter(p => p).length <= 1);
    
    const navigation = {
        homepage: isHomePage ? 'index.html' : basePath + 'Home Page/index.html',
        profile: basePath + 'profile and bookings/profile&bookings.html',
        booking: basePath + 'Booking Form/booking-form.html',
        listing: basePath + 'listing-page/listing.html',
        flights: basePath + 'Flights/flights.html',
        carRentals: basePath + 'Car Rentals/car-rentals.html',
        attractions: basePath + 'Attractions/attractions.html',
        airportTaxis: basePath + 'Airport Taxis/airport-taxis.html',
        login: basePath + 'Roomify-login/login.html'
    };

    // Chatbot state
    let isOpen = false;
    let conversationContext = null;

    // Initialize chatbot
    function initChatbot() {
        const chatIcon = document.getElementById('chatbot-icon');
        const chatBox = document.getElementById('chatbot-box');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const userInput = document.getElementById('chatbot-user-input');

        // Open/Close chat
        if (chatIcon) {
            chatIcon.addEventListener('click', toggleChat);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeChat);
        }

        // Send message
        if (sendBtn) {
            sendBtn.addEventListener('click', handleMessage);
        }

        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleMessage();
                }
            });
        }

        // Initial greeting
        setTimeout(() => {
            if (!isOpen) {
                showGreeting();
            }
        }, 1000);
    }

    function toggleChat() {
        const chatBox = document.getElementById('chatbot-box');
        isOpen = !isOpen;
        
        if (isOpen) {
            chatBox.classList.add('open');
            const input = document.getElementById('chatbot-user-input');
            if (input) {
                setTimeout(() => input.focus(), 300);
            }
        } else {
            chatBox.classList.remove('open');
        }
    }

    function closeChat() {
        const chatBox = document.getElementById('chatbot-box');
        isOpen = false;
        chatBox.classList.remove('open');
    }

    function handleMessage() {
        const userInput = document.getElementById('chatbot-user-input');
        const input = userInput.value.trim();
        
        if (input === '') return;

        addMessage('user', input);
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate thinking time
        setTimeout(() => {
            removeTypingIndicator();
            respondToMessage(input);
        }, 800);
    }

    function addMessage(sender, text, isHTML = false) {
        const messages = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (isHTML) {
            contentDiv.innerHTML = text;
        } else {
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(contentDiv);
        
        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timeDiv);
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function showTypingIndicator() {
        const messages = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function createButton(text, href, className = 'message-button') {
        const button = document.createElement('a');
        button.href = href;
        button.className = className;
        button.textContent = text;
        button.onclick = function(e) {
            e.stopPropagation();
        };
        return button;
    }

    function createQuickActionButtons(actions) {
        const container = document.createElement('div');
        container.className = 'quick-actions';
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.textContent = action.label;
            btn.onclick = () => {
                addMessage('user', action.label);
                setTimeout(() => {
                    action.callback();
                }, 300);
            };
            container.appendChild(btn);
        });
        
        return container;
    }

    function respondToMessage(msg) {
        const lowerMsg = msg.toLowerCase();
        conversationContext = lowerMsg;
        
        // Enhanced responses with interactive navigation
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            showGreeting();
        }
        else if (lowerMsg.includes('profile') || lowerMsg.includes('my account') || lowerMsg.includes('account')) {
            showProfileResponse();
        }
        else if (lowerMsg.includes('booking') || lowerMsg.includes('book') || lowerMsg.includes('reserve')) {
            showBookingResponse();
        }
        else if (lowerMsg.includes('home') || lowerMsg.includes('homepage') || lowerMsg.includes('main')) {
            showHomeResponse();
        }
        else if (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('stays')) {
            showSearchResponse();
        }
        else if (lowerMsg.includes('flights') || lowerMsg.includes('flight')) {
            showFlightsResponse();
        }
        else if (lowerMsg.includes('car') || lowerMsg.includes('rental')) {
            showCarRentalsResponse();
        }
        else if (lowerMsg.includes('attraction') || lowerMsg.includes('activity')) {
            showAttractionsResponse();
        }
        else if (lowerMsg.includes('taxi') || lowerMsg.includes('airport')) {
            showAirportTaxisResponse();
        }
        else if (lowerMsg.includes('listing') || lowerMsg.includes('property') || lowerMsg.includes('host')) {
            showListingResponse();
        }
        else if (lowerMsg.includes('help') || lowerMsg.includes('support') || lowerMsg.includes('assist')) {
            showHelpResponse();
        }
        else if (lowerMsg.includes('logout') || lowerMsg.includes('log out') || lowerMsg.includes('sign out')) {
            showLogoutResponse();
        }
        else if (lowerMsg.includes('thank') || lowerMsg.includes('thanks')) {
            addMessage('bot', "You're welcome! 😊 Is there anything else I can help you with?");
        }
        else {
            showDefaultResponse();
        }
    }

    function showGreeting() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p><strong>Hello! 👋</strong></p>
            <p>I'm your Roomify assistant. I can help you navigate to different sections of our platform!</p>
            <p><strong>What would you like to do?</strong></p>
        `;
        
        messageDiv.appendChild(content);
        
        const actions = createQuickActionButtons([
            { label: '🏠 Home', callback: () => showHomeResponse() },
            { label: '👤 Profile', callback: () => showProfileResponse() },
            { label: '📅 Book Now', callback: () => showBookingResponse() },
            { label: '✈️ Flights', callback: () => showFlightsResponse() },
            { label: '🚗 Car Rentals', callback: () => showCarRentalsResponse() },
            { label: '🏛️ Attractions', callback: () => showAttractionsResponse() }
        ]);
        
        messageDiv.appendChild(actions);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showProfileResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p>Here's your profile page where you can:</p>
            <ul style="margin: 8px 0; padding-left: 20px;">
                <li>View your bookings</li>
                <li>Edit your profile</li>
                <li>Manage your account settings</li>
            </ul>
        `;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Go to My Profile →', navigation.profile);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showBookingResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p>Ready to book your stay? I can take you to the booking form where you can:</p>
            <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Fill in your details</li>
                <li>Select dates and guests</li>
                <li>Complete your reservation</li>
            </ul>
        `;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Open Booking Form →', navigation.booking);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showHomeResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p>Let me take you back to the homepage where you can:</p>
            <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Search for accommodations</li>
                <li>Browse popular destinations</li>
                <li>View special offers</li>
            </ul>
        `;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Go to Homepage →', navigation.homepage);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showSearchResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Search for amazing places to stay! 🔍</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Start Searching →', navigation.homepage);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showFlightsResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Search and book flights to your favorite destinations! ✈️</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Search Flights →', navigation.flights);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showCarRentalsResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Find the perfect car for your journey! 🚗</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Browse Cars →', navigation.carRentals);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showAttractionsResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Discover amazing attractions and activities! 🏛️</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Explore Attractions →', navigation.attractions);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showAirportTaxisResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Book reliable airport transfer services! 🚕</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Book Airport Taxi →', navigation.airportTaxis);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showListingResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Want to become a host? List your property and start earning! 🏡</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('List Your Property →', navigation.listing);
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showHelpResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p><strong>I can help you with:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Navigating to different pages</li>
                <li>Finding bookings and reservations</li>
                <li>Accessing your profile</li>
                <li>Searching for accommodations</li>
            </ul>
            <p>Just tell me what you'd like to do!</p>
        `;
        
        messageDiv.appendChild(content);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showLogoutResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>Logging out will take you back to the homepage. 👋</p>`;
        
        messageDiv.appendChild(content);
        
        const button = createButton('Log Out →', navigation.homepage, 'message-button secondary');
        messageDiv.appendChild(button);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function showDefaultResponse() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <p>I'm not sure I understood that. 😅</p>
            <p>I can help you navigate to:</p>
        `;
        
        messageDiv.appendChild(content);
        
        const actions = createQuickActionButtons([
            { label: 'Home', callback: () => showHomeResponse() },
            { label: 'Profile', callback: () => showProfileResponse() },
            { label: 'Booking', callback: () => showBookingResponse() },
            { label: 'Help', callback: () => showHelpResponse() }
        ]);
        
        messageDiv.appendChild(actions);
        messageDiv.appendChild(createTimeElement());
        
        document.getElementById('chatbot-messages').appendChild(messageDiv);
        scrollToBottom();
    }

    function createTimeElement() {
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return timeDiv;
    }

    function scrollToBottom() {
        const messages = document.getElementById('chatbot-messages');
        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();

