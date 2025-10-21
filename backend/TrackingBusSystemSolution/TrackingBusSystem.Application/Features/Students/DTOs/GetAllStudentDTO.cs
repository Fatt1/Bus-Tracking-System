using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public record GetAllStudentDTO
    {
        public long Id { get; set; }

        public string Class { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public Gender Sex { get; set; }

        public string ParentName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string ParentPhoneNumber { get; set; } = string.Empty;
    }
}
