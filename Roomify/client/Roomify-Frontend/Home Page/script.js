// Set min date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('checkin').min = today;
document.getElementById('checkout').min = today;

// Update checkout date
document.getElementById('checkin').addEventListener('change', function () {
    const checkinDate = new Date(this.value);
    checkinDate.setDate(checkinDate.getDate() + 1);
    const minCheckout = checkinDate.toISOString().split('T')[0];

    const checkout = document.getElementById('checkout');
    checkout.min = minCheckout;

    if (checkout.value < minCheckout) {
        checkout.value = minCheckout;
    }
});

// Search form alert
document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const destination = document.getElementById('destination').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;

    alert(`Searching for:\nDestination: ${destination}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}`);
});

// Listings Management
let allListings = [];
let currentFilter = 'all';

// Load listings from localStorage
function loadListings() {
    const stored = localStorage.getItem('roomify_listings');
    allListings = stored ? JSON.parse(stored) : [];
    displayListings(allListings);
}

// Display listings
function displayListings(listings) {
    const grid = document.getElementById('listings-grid');
    const noListings = document.getElementById('no-listings');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (listings.length === 0) {
        grid.style.display = 'none';
        if (noListings) noListings.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (noListings) noListings.style.display = 'none';
    
    listings.forEach(listing => {
        const card = createListingCard(listing);
        grid.appendChild(card);
    });
}

// Create listing card
function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    
    const imageUrl = listing.photos && listing.photos.length > 0 
        ? listing.photos[0] 
        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
    
    const propertyTypes = listing.propertyTypes || [];
    const typesHTML = propertyTypes.map(type => 
        `<span class="listing-type-badge">${type}</span>`
    ).join('');
    
    const amenities = listing.amenities || [];
    const amenitiesHTML = amenities.slice(0, 3).map(amenity => 
        `<span class="listing-amenity"><i class="fas fa-check"></i> ${amenity}</span>`
    ).join('');
    
    const description = listing.description 
        ? (listing.description.length > 100 ? listing.description.substring(0, 100) + '...' : listing.description)
        : 'No description available';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${listing.title}" class="listing-image" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'">
        <div class="listing-content">
            <div class="listing-header">
                <h3 class="listing-title">${listing.title || 'Untitled Property'}</h3>
                <div class="listing-price">
                    $${parseFloat(listing.price || 0).toFixed(2)}
                    <span class="listing-price-period">/night</span>
                </div>
            </div>
            <div class="listing-types">
                ${typesHTML}
            </div>
            <div class="listing-details">
                <div class="listing-detail-item">
                    <i class="fas fa-users"></i>
                    <span>${listing.guests || 0} guests</span>
                </div>
                <div class="listing-detail-item">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>${formatTime(listing.checkin) || 'N/A'}</span>
                </div>
                <div class="listing-detail-item">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>${formatTime(listing.checkout) || 'N/A'}</span>
                </div>
            </div>
            <p class="listing-description">${description}</p>
            ${amenities.length > 0 ? `<div class="listing-amenities">${amenitiesHTML}</div>` : ''}
            <div class="listing-actions">
                <a href="../Booking Form/booking-form.html?listingId=${listing.id}" class="btn-book-now">
                    <i class="fas fa-calendar-check"></i> Book Now
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// Format time
function formatTime(timeString) {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Filter listings
function filterListings(filterType) {
    currentFilter = filterType;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterType) {
            btn.classList.add('active');
        }
    });
    
    let filtered = allListings;
    
    if (filterType !== 'all') {
        filtered = allListings.filter(listing => {
            const types = listing.propertyTypes || [];
            return types.includes(filterType);
        });
    }
    
    displayListings(filtered);
}

// Initialize listings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadListings();
    
    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterListings(this.dataset.filter);
        });
    });
    
    // Make property type cards clickable to filter
    document.querySelectorAll('.property-type-card').forEach(card => {
        const link = card.querySelector('.property-link');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const propertyName = card.querySelector('.property-name')?.textContent.trim();
                if (propertyName) {
                    // Scroll to stays section
                    const staysSection = document.getElementById('stays-section');
                    if (staysSection) {
                        staysSection.scrollIntoView({ behavior: 'smooth' });
                        // Filter after a short delay to allow scroll
                        setTimeout(() => {
                            filterListings(propertyName);
                        }, 500);
                    }
                }
            });
        }
    });
});