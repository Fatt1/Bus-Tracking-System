using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record GetDriverDTO
    {
        public int Id { get; init; }

        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string IDCard { get; init; } = string.Empty;
        public string PhoneNumber { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public string? AssignedBus { get; init; }
        public DateOnly DateOfBirth { get; init; }
        public Gender Sex { get; init; }

        //Tài khoản 

        public string UserName { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }
}
