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

// Search form handler
document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const destination = document.getElementById('destination').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;

    // Redirect to search results or filter listings
    if (destination || checkin || checkout) {
        try {
            const searchParams = {
                location: destination || undefined,
                checkIn: checkin ? new Date(checkin) : undefined,
                checkOut: checkout ? new Date(checkout) : undefined,
                page: 1,
                pageSize: 50
            };
            
            const results = await api.searchListings(searchParams);
            allListings = Array.isArray(results) ? results.map(r => ({
                id: r.listingId,
                title: r.title,
                description: r.shortDescription,
                city: r.city,
                pricePerNight: r.pricePerNight,
                photoUrls: []
            })) : [];
            displayListings(allListings);
            
            // Scroll to listings section
            const staysSection = document.getElementById('stays-section');
            if (staysSection) {
                staysSection.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed. Please try again.');
        }
    } else {
        // Just reload all listings
        await loadListings();
    }
});

// Listings Management
let allListings = [];
let currentFilter = 'all';
let isLoading = false;
let currentReviewListingId = null;

// Load listings from API
async function loadListings() {
    const grid = document.getElementById('listings-grid');
    const noListings = document.getElementById('no-listings');
    
    if (isLoading) return;
    isLoading = true;
    
    // Show loading state
    if (grid) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading listings...</p></div>';
    }
    
    try {
        const listings = await api.getListings({ page: 1, pageSize: 50 });
        allListings = Array.isArray(listings) ? listings : [];
        displayListings(allListings);
    } catch (error) {
        console.error('Error loading listings:', error);
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff4757;"><i class="fas fa-exclamation-triangle fa-2x"></i><p>Failed to load listings. Please try again later.</p></div>';
        }
    } finally {
        isLoading = false;
    }
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
    
    const imageUrl = (listing.photoUrls && listing.photoUrls.length > 0) 
        ? listing.photoUrls[0] 
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
                    $${parseFloat(listing.pricePerNight || 0).toFixed(2)}
                    <span class="listing-price-period">/night</span>
                </div>
            </div>
            ${typesHTML ? `<div class="listing-types">${typesHTML}</div>` : ''}
            <div class="listing-details">
                <div class="listing-detail-item">
                    <i class="fas fa-users"></i>
                    <span>${listing.maxGuests || 0} guests</span>
                </div>
                <div class="listing-detail-item">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>${formatTime(listing.checkInTime) || 'N/A'}</span>
                </div>
                <div class="listing-detail-item">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>${formatTime(listing.checkOutTime) || 'N/A'}</span>
                </div>
            </div>
            <p class="listing-description">${description}</p>
            ${amenities.length > 0 ? `<div class="listing-amenities">${amenitiesHTML}</div>` : ''}
            <div class="listing-actions">
                <a href="../Booking Form/booking-form.html?listingId=${listing.id}" class="btn-book-now">
                    <i class="fas fa-calendar-check"></i> Book Now
                </a>
                <button class="btn-review" type="button" data-listing-id="${listing.id}" data-listing-title="${listing.title || 'Listing'}">
                    <i class="fas fa-star"></i> Write Review
                </button>
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

// Review modal helpers
function openReviewModal(listingId, listingTitle) {
    const token = api.getAuthToken();
    if (!token) {
        alert('Please sign in to write a review.');
        window.location.href = '../Roomify-login/login.html';
        return;
    }
    currentReviewListingId = listingId;
    const titleEl = document.getElementById('review-listing-title');
    if (titleEl) titleEl.textContent = `Write a Review - ${listingTitle}`;
    const ratingInput = document.getElementById('review-rating');
    const commentInput = document.getElementById('review-comment');
    if (ratingInput) ratingInput.value = '';
    if (commentInput) commentInput.value = '';
    const modal = document.getElementById('review-modal');
    if (modal) modal.style.display = 'flex';
}

function closeReviewModal() {
    currentReviewListingId = null;
    const modal = document.getElementById('review-modal');
    if (modal) modal.style.display = 'none';
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!currentReviewListingId) {
        alert('No listing selected.');
        return;
    }
    const ratingInput = document.getElementById('review-rating');
    const commentInput = document.getElementById('review-comment');
    const rating = parseInt(ratingInput?.value ?? '', 10);
    const comment = (commentInput?.value ?? '').trim();

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert('Please provide a rating between 1 and 5.');
        return;
    }

    try {
        await api.createReview(currentReviewListingId, { rating, comment });
        alert('Review submitted successfully!');
        closeReviewModal();
    } catch (error) {
        console.error('Error submitting review:', error);
        if (error.status === 400) {
            alert(error.message || 'You can only review completed stays.');
        } else if (error.status === 401) {
            alert('Please sign in to write a review.');
            window.location.href = '../Roomify-login/login.html';
        } else {
            alert('Failed to submit review. Please try again.');
        }
    }
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

    // Review modal events
    const reviewForm = document.getElementById('review-form');
    const reviewModal = document.getElementById('review-modal');
    const reviewClose = document.getElementById('review-modal-close');
    const reviewCancel = document.getElementById('review-cancel');
    const listingsGrid = document.getElementById('listings-grid');

    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    reviewClose?.addEventListener('click', closeReviewModal);
    reviewCancel?.addEventListener('click', closeReviewModal);

    if (listingsGrid) {
        listingsGrid.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-review');
            if (!target) return;
            const listingId = target.dataset.listingId;
            const listingTitle = target.dataset.listingTitle || 'Listing';
            openReviewModal(listingId, listingTitle);
        });
    }
});