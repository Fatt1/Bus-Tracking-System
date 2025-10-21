using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Domain.Entities
{

    public class Route
    {
        public int Id { get; set; }
        public string RouteName { get; set; } = string.Empty;
        // Navigation properties
        public virtual ICollection<Bus> Buses { get; set; } = new List<Bus>();
        public virtual ICollection<Point> Points { get; set; } = new List<Point>();
        public virtual ICollection<ScheduleAssignment> ScheduleAssignments { get; set; } = new List<ScheduleAssignment>();
        public virtual ICollection<GeneratedTrip> GeneratedTrips { get; set; } = new List<GeneratedTrip>();
    }

    public static class RouteErrors
    {
        public static Error RouteNotFound(int id) => new Error("Route.NotFound", $"The route with id {id} was not found.");
    }
}
