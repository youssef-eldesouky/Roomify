// API Service Layer for Roomify Frontend
// Centralized API communication with backend

const API_BASE_URL = window.location.origin + '/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get authentication token from localStorage
     */
    getAuthToken() {
        return localStorage.getItem('roomify_token');
    }

    /**
     * Store authentication token in localStorage
     */
    setAuthToken(token) {
        localStorage.setItem('roomify_token', token);
    }

    /**
     * Clear authentication token and user data
     */
    clearAuthToken() {
        localStorage.removeItem('roomify_token');
        localStorage.removeItem('roomify_refresh_token');
        localStorage.removeItem('roomifyUser');
    }

    /**
     * Make API request with automatic token handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAuthToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                this.clearAuthToken();
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    window.location.href = '/Roomify-Frontend/Roomify-login/login.html';
                }
                throw new Error('Unauthorized - Please login again');
            }

            // Handle non-OK responses
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                let errorDetails = null;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.title || errorMessage;
                    errorDetails = errorData;
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                
                // Create error with more details
                const error = new Error(errorMessage);
                error.status = response.status;
                error.details = errorDetails;
                throw error;
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH ENDPOINTS ====================

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<AuthResponse>}
     */
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Support both camelCase and PascalCase responses
        const token = response.token || response.Token;
        const refreshToken = response.refreshToken || response.RefreshToken;
        const userId = response.userId ?? response.userID ?? response.UserId;
        const fullName = response.fullName || response.FullName;
        const country = response.country || response.Country;
        const phone = response.phone || response.Phone;
        const role = response.role || response.Role;

        if (token) {
            this.setAuthToken(token);
            if (refreshToken) {
                localStorage.setItem('roomify_refresh_token', refreshToken);
            }
            
            // Store user data
            localStorage.setItem('roomifyUser', JSON.stringify({
                userId,
                email: response.email || response.Email,
                fullName,
                phone,
                country,
                role,
                isLoggedIn: true
            }));
        }
        
        return response;
    }

    /**
     * Register new user
     * @param {string} fullName - User full name
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} phone - User phone (optional)
     * @param {string} country - User country (optional)
     * @returns {Promise<AuthResponse>}
     */
    async register(fullName, email, password, phone = null, country = null) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password, phone, country })
        });
        
        // Support both camelCase and PascalCase responses
        const token = response.token || response.Token;
        const refreshToken = response.refreshToken || response.RefreshToken;
        const userId = response.userId ?? response.userID ?? response.UserId;
        const normalizedCountry = response.country || response.Country;
        const normalizedPhone = response.phone || response.Phone;
        const normalizedRole = response.role || response.Role;

        if (token) {
            this.setAuthToken(token);
            if (refreshToken) {
                localStorage.setItem('roomify_refresh_token', refreshToken);
            }
            
            // Store user data
            localStorage.setItem('roomifyUser', JSON.stringify({
                userId,
                email: response.email || response.Email,
                fullName: response.fullName || response.FullName,
                phone: normalizedPhone,
                country: normalizedCountry,
                role: normalizedRole,
                isLoggedIn: true
            }));
        }
        
        return response;
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<AuthResponse>}
     */
    async refreshToken(refreshToken) {
        const response = await this.request('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });
        
        if (response.token) {
            this.setAuthToken(response.token);
            if (response.refreshToken) {
                localStorage.setItem('roomify_refresh_token', response.refreshToken);
            }
        }
        
        return response;
    }

    /**
     * Logout user (revoke refresh token)
     */
    async logout() {
        const refreshToken = localStorage.getItem('roomify_refresh_token');
        if (refreshToken) {
            try {
                await this.request('/auth/revoke', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken })
                });
            } catch (error) {
                console.error('Error revoking token:', error);
            }
        }
        this.clearAuthToken();
    }

    // ==================== LISTING ENDPOINTS ====================

    /**
     * Get all listings with optional filters
     * @param {object} filters - Filter options
     * @returns {Promise<ListingDto[]>}
     */
    async getListings(filters = {}) {
        const { city, minPrice, maxPrice, page = 1, pageSize = 20 } = filters;
        const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        
        if (city) params.append('city', city);
        if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
        if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
        
        return await this.request(`/listings?${params}`);
    }

    /**
     * Get listing by ID
     * @param {number} id - Listing ID
     * @returns {Promise<ListingDto>}
     */
    async getListing(id) {
        return await this.request(`/listings/${id}`);
    }

    /**
     * Create new listing (requires authentication)
     * @param {object} listingData - Listing data
     * @returns {Promise<ListingDto>}
     */
    async createListing(listingData) {
        return await this.request('/listings', {
            method: 'POST',
            body: JSON.stringify(listingData)
        });
    }

    /**
     * Update listing (requires authentication)
     * @param {number} id - Listing ID
     * @param {object} listingData - Updated listing data
     * @returns {Promise<ListingDto>}
     */
    async updateListing(id, listingData) {
        return await this.request(`/listings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(listingData)
        });
    }

    /**
     * Delete listing (requires authentication)
     * @param {number} id - Listing ID
     */
    async deleteListing(id) {
        return await this.request(`/listings/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get listing availability
     * @param {number} id - Listing ID
     * @param {Date} from - Start date
     * @param {Date} to - End date
     * @returns {Promise<BlockedRangeDto[]>}
     */
    async getListingAvailability(id, from, to) {
        const fromStr = from.toISOString().split('T')[0];
        const toStr = to.toISOString().split('T')[0];
        return await this.request(`/listings/${id}/availability?from=${fromStr}&to=${toStr}`);
    }

    // ==================== BOOKING ENDPOINTS ====================

    /**
     * Create new booking (requires authentication)
     * @param {object} bookingData - Booking data { listingId, startDate, endDate }
     * @returns {Promise<BookingDto>}
     */
    async createBooking(bookingData) {
        return await this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    /**
     * Create a review for a listing (requires auth)
     * @param {number} listingId - Listing ID
     * @param {{rating:number, comment?:string}} payload - Review data
     */
    async createReview(listingId, payload) {
        return await this.request(`/listings/${listingId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * Get current user's bookings (requires authentication)
     * @returns {Promise<BookingDto[]>}
     */
    async getMyBookings() {
        return await this.request('/bookings/my');
    }

    // ==================== SEARCH ENDPOINTS ====================

    /**
     * Search listings
     * @param {object} searchParams - Search parameters
     * @returns {Promise<SearchResultDto[]>}
     */
    async searchListings(searchParams) {
        const params = new URLSearchParams();
        
        if (searchParams.location) params.append('location', searchParams.location);
        if (searchParams.minPrice !== undefined) params.append('minPrice', searchParams.minPrice.toString());
        if (searchParams.maxPrice !== undefined) params.append('maxPrice', searchParams.maxPrice.toString());
        if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn.toISOString().split('T')[0]);
        if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut.toISOString().split('T')[0]);
        if (searchParams.page) params.append('page', searchParams.page.toString());
        if (searchParams.pageSize) params.append('pageSize', searchParams.pageSize.toString());
        
        return await this.request(`/search?${params}`);
    }
}

// Create singleton instance - make it globally available
const api = new ApiService();

// Make sure it's available globally
if (typeof window !== 'undefined') {
    window.api = api;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}

// Log that API service is loaded
console.log('API Service loaded and ready');

