namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    public record GetRouteAssignmentTodayDTO
    {
        public int RouteId { get; init; }
        public int ScheduleId { get; init; }
        public string ScheduleName { get; init; } = string.Empty;
        public string RouteName { get; init; } = string.Empty;
        public int AssignmentId { get; init; }
        public int DriverId { get; init; }
        public string DriverName { get; init; } = string.Empty;
        public int BusId { get; init; }
        public string BusName { get; init; } = string.Empty;
    }
}

