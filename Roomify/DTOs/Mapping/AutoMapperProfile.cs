using AutoMapper;
using Roomify.DTOs.Auth;
using Roomify.DTOs.Bookings;
using Roomify.DTOs.Listings;
using Roomify.DTOs.Users;
using Roomify.Models;

namespace Roomify.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserDto>();
            CreateMap<RegisterRequest, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // handled in service
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "User"));

            CreateMap<Listing, ListingDto>().ReverseMap();
            CreateMap<CreateListingRequest, Listing>();

            CreateMap<Booking, BookingDto>().ReverseMap();
            CreateMap<CreateBookingRequest, Booking>();
        }
    }
}
