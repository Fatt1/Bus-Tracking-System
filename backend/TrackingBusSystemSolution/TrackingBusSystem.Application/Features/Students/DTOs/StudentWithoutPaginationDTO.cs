namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public class StudentWithoutPaginationDTO
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Class { get; set; } = string.Empty;
    }
}
