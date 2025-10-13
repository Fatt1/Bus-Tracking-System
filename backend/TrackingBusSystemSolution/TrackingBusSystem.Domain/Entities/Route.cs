using System.ComponentModel.DataAnnotations;

namespace TrackingBusSystem.Domain.Entities
{
    public class Route
    {
        [Key]
        public int Id { get; set; }
        public string RouteName { get; set; } = default!;
        public string RouteDescription { get; set; } = default!;

        public ICollection<Point> Points { get; set; } = new List<Point>();
    }
}
