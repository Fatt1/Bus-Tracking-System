namespace TrackingBusSystem.Domain.Entities
{
    public class StopPoint
    {

        public int Id { get; set; }

        public string PointName { get; set; } = null!;

        public int RouteId { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public int SequenceOrder { get; set; }

        public virtual Route Route { get; set; } = null!;

        public virtual ICollection<StudentCheckingHistory> StudentCheckingHistories { get; set; } = new List<StudentCheckingHistory>();

        public virtual ICollection<Student> Students { get; set; } = new List<Student>();
    }

}
