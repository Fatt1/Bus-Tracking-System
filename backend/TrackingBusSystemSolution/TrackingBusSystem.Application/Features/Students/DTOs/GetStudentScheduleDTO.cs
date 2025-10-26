namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public record GetStudentScheduleDTO
    {
        public int ScheduleId { get; init; }
        public DateOnly ScheduleDate { get; init; }
        public string RouteName { get; init; } = string.Empty;
        public int PointId { get; init; }
        public string StopPointName { get; init; } = string.Empty;
        public int RouteId { get; init; }
        public int BusId { get; init; }
        public string BusName { get; init; } = string.Empty;
        public int DriverId { get; init; }
        public TimeOnly PickupTime { get; init; }
        public TimeOnly DropOffTime { get; init; }
        public string DriverName { get; init; } = string.Empty;

    }
}
