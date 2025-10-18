namespace TrackingBusSystem.Application.Features.Schedules.DTOs
{
    public record GetScheduleDTO
    {
        public int Id { get; set; }

        public string ScheduleName { get; set; } = string.Empty;

        public string ScheduleType { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public string Status { get; set; }


        public IReadOnlyCollection<DayOfWeek> DayOfWeeks { get; set; }
        public IReadOnlyCollection<ScheduleAssignmentDTO> ScheduleAssignments { get; set; }
    }

    public record ScheduleAssignmentDTO
    {
        public int Id { get; set; }
        public int RouteId { get; set; }
        public string RouteName { get; set; }
        public int DriverId { get; set; }
        public string DriverName { get; set; }
        public TimeSpan MorningDeparture { get; set; }
        public TimeSpan MorningArrival { get; set; }
        public TimeSpan AfternoonDeparture { get; set; }
        public TimeSpan AfternoonArrival { get; set; }
    }
}
