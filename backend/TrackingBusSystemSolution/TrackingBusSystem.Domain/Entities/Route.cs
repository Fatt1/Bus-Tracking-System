using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Domain.Entities
{

    public class Route
    {
        public int Id { get; set; }

        public string RouteName { get; set; } = null!;

        public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

        public virtual ICollection<StopPoint> StopPoints { get; set; } = new List<StopPoint>();
    }

    public static class RouteErrors
    {
        public static Error RouteNotFound(int id) => new Error("Route.NotFound", $"The route with id {id} was not found.");

        public static Error RouteNotAvaliable(int routeId, DateOnly date) => new Error(
            Code: "Route.NotAvaliable",
            Message: $"The route with id {routeId} is not avaliable on {date}."
        );
    }
}
