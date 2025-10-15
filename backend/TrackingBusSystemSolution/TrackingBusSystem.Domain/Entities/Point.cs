namespace TrackingBusSystem.Domain.Entities
{
    public class Point
    {

        public int Id { get; set; }


        public string PointName { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public int RouteId { get; set; }

        public virtual Route Route { get; set; } = null!;
        public virtual ICollection<Student> Students { get; set; } = new List<Student>();
    }

}
