using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public record GetStudentDTO
    {
        public long Id { get; set; }

        // Thông tin học sinh
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Class { get; set; } = string.Empty;
        public Gender Sex { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ParentName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string ParentPhoneNumber { get; set; } = string.Empty;


        public int StopPointId { get; set; }
        public string StopPointName { get; set; } = string.Empty;

        public int RouteId { get; set; }
        public string RouteName { get; set; } = string.Empty;



        // Thông tin tài khoản
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
