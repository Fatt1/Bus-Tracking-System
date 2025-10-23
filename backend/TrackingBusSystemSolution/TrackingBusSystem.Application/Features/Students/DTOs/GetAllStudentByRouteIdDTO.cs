namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public record GetAllStudentByRouteIdDTO
    {
        public string FullName { get; init; } = string.Empty;
        public string StopPointName { get; init; } = string.Empty;
    }
}
