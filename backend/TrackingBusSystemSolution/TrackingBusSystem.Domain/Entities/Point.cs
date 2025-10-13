using System.ComponentModel.DataAnnotations;

namespace TrackingBusSystem.Domain.Entities
{
    public class Point
    {
        [Key]
        public int Id { get; set; }
        public string NamePoint { get; set; } = default!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public int RouteId { get; set; }
        public Route Route { get; set; } = default!;
    }
}
