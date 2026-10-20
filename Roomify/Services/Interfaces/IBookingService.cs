using Roomify.DTOs.Bookings;

namespace Roomify.Services.Interfaces
{
    public interface IBookingService
    {
        Task<BookingDto> CreateBookingAsync(int guestUserId, CreateBookingRequest req); // will create Pending booking, reserve hold
        Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId);
        Task ConfirmBookingAsync(int bookingId); // admin or payment webhook will call later
        Task ExpireBookingAsync(int bookingId); // expire booking and release holds
    }
}
