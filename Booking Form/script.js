// Booking Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const cardNumberInput = document.getElementById('cardNumber');
    const cvvInput = document.getElementById('cvv');
    const expiryYearSelect = document.getElementById('expiryYear');
    
    // Load listing data from URL if listingId is provided
    let currentListing = null;
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('listingId');
    
    if (listingId) {
        loadListingData(listingId);
    }
    
    // Load listing data from localStorage
    function loadListingData(id) {
        const listings = JSON.parse(localStorage.getItem('roomify_listings') || '[]');
        currentListing = listings.find(listing => listing.id === id);
        
        if (currentListing) {
            // Pre-fill form with listing data
            const destinationInput = document.getElementById('destination');
            const propertyTypeSelect = document.getElementById('propertyType');
            const guestsSelect = document.getElementById('guests');
            
            if (destinationInput) {
                destinationInput.value = currentListing.title || '';
            }
            
            if (propertyTypeSelect && currentListing.propertyTypes && currentListing.propertyTypes.length > 0) {
                const firstType = currentListing.propertyTypes[0].toLowerCase();
                // Map property types to select values
                const typeMap = {
                    'hotels': 'hotel',
                    'apartments': 'apartment',
                    'villas': 'villa',
                    'resorts': 'resort',
                    'bed & breakfast': 'bed-breakfast',
                    'guest houses': 'guest-house',
                    'hostels': 'hostel'
                };
                const mappedType = typeMap[firstType] || firstType;
                propertyTypeSelect.value = mappedType;
            }
            
            if (guestsSelect && currentListing.guests) {
                guestsSelect.value = currentListing.guests;
            }
            
            // Display listing info in summary
            displayListingInfo(currentListing);
            
            // Update summary calculation to use listing price
            updateSummary();
        }
    }
    
    // Display listing information
    function displayListingInfo(listing) {
        // Add listing info to summary sidebar if needed
        const summaryTitle = document.querySelector('.summary-title');
        if (summaryTitle && listing) {
            // You can add listing image or other details here
        }
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkInInput.min = today;
    checkOutInput.min = today;

    // Populate expiry years (current year to 10 years ahead)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        expiryYearSelect.appendChild(option);
    }

    // Update checkout date minimum when check-in changes
    checkInInput.addEventListener('change', function() {
        const checkInDate = new Date(this.value);
        checkInDate.setDate(checkInDate.getDate() + 1);
        const minCheckout = checkInDate.toISOString().split('T')[0];
        checkOutInput.min = minCheckout;

        if (checkOutInput.value && checkOutInput.value < minCheckout) {
            checkOutInput.value = minCheckout;
        }
        updateSummary();
    });

    // Update summary when form fields change
    const formInputs = bookingForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateSummary);
        input.addEventListener('input', updateSummary);
    });

    // Format card number with spaces
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Only allow numbers for CVV
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Only allow numbers and spaces for card number
    cardNumberInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^\d\s]/g, '');
    });

    // Update booking summary
    function updateSummary() {
        const destination = document.getElementById('destination').value || '-';
        const checkIn = document.getElementById('checkIn').value || '-';
        const checkOut = document.getElementById('checkOut').value || '-';
        const guests = document.getElementById('guests').value || '-';
        const rooms = document.getElementById('rooms').value || '-';

        document.getElementById('summaryDestination').textContent = destination;
        document.getElementById('summaryCheckIn').textContent = formatDate(checkIn);
        document.getElementById('summaryCheckOut').textContent = formatDate(checkOut);
        document.getElementById('summaryGuests').textContent = guests === '-' ? '-' : `${guests} ${guests === '1' ? 'Guest' : 'Guests'}`;
        document.getElementById('summaryRooms').textContent = rooms === '-' ? '-' : `${rooms} ${rooms === '1' ? 'Room' : 'Rooms'}`;

        // Calculate total
        if (checkIn !== '-' && checkOut !== '-' && rooms !== '-') {
            const nights = calculateNights(checkIn, checkOut);
            const roomCount = parseInt(rooms) || 1;
            
            // Use listing price if available, otherwise use default
            let basePrice = 1500; // Default EGP per night per room
            if (currentListing && currentListing.price) {
                basePrice = parseFloat(currentListing.price);
            }
            
            const total = nights * roomCount * basePrice;
            const currency = currentListing ? 'USD' : 'EGP';
            document.getElementById('summaryTotal').textContent = `${currency} ${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        } else {
            document.getElementById('summaryTotal').textContent = currentListing ? 'USD 0.00' : 'EGP 0.00';
        }
    }

    // Format date for display
    function formatDate(dateString) {
        if (dateString === '-') return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    // Calculate number of nights
    function calculateNights(checkIn, checkOut) {
        if (checkIn === '-' || checkOut === '-') return 0;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate - checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Form validation and submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Check if form is valid
        if (!bookingForm.checkValidity()) {
            bookingForm.classList.add('was-validated');
            return;
        }

        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            destination: document.getElementById('destination').value,
            propertyType: document.getElementById('propertyType').value,
            checkIn: document.getElementById('checkIn').value,
            checkOut: document.getElementById('checkOut').value,
            guests: document.getElementById('guests').value,
            rooms: document.getElementById('rooms').value,
            roomType: document.getElementById('roomType').value,
            cardName: document.getElementById('cardName').value,
            cardNumber: document.getElementById('cardNumber').value,
            expiryMonth: document.getElementById('expiryMonth').value,
            expiryYear: document.getElementById('expiryYear').value,
            cvv: document.getElementById('cvv').value,
            specialRequests: document.getElementById('specialRequests').value,
            newsletter: document.getElementById('newsletter').checked
        };

        // Disable submit button
        const submitBtn = bookingForm.querySelector('.btn-booking');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate API call
        setTimeout(() => {
            // Show success message
            showSuccessMessage(formData);
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Confirm Booking';
            
            // Reset form
            bookingForm.reset();
            bookingForm.classList.remove('was-validated');
            updateSummary();
        }, 2000);
    });

    // Show success message
    function showSuccessMessage(formData) {
        // Create success modal/alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '400px';
        alertDiv.style.maxWidth = '90%';
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-check-circle fa-2x me-3"></i>
                <div>
                    <h5 class="mb-1">Booking Confirmed!</h5>
                    <p class="mb-0">Your reservation has been successfully submitted. A confirmation email will be sent to ${formData.email}</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Initial summary update
    updateSummary();
});

