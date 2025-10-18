namespace TrackingBusSystem.Application.Features.Schedules.DTOs
{
    public record GetAllScheduleDTO
    {
        public int Id { get; set; }
        public string ScheduleName { get; set; } = string.Empty;
        public string ScheduleType { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
