namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    // Record này tự động có các thuộc tính 'init' cho Id, RouteName, v.v.
    public class GetRoutesResponse
    {
        public int Id { get; init; }
        public string RouteName { get; init; } = string.Empty;
        public int ScheduleAssignmentCount { get; init; }
    }
}
