namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public record GetAllStudentDTO
    {
        public long Id { get; set; }


        public string FullName { get; set; } = string.Empty;

        public string Class { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string ParentName { get; set; } = string.Empty;

        public string ParentPhoneNumber { get; set; } = string.Empty;
    }
}
