namespace TrackingBusSystem.Domain.Entities
{
    public class ScheduleAssignment
    {

        public int Id { get; set; }
        public int ScheduleId { get; set; }
        public int RouteId { get; set; }
        public int DriverId { get; set; }


        public virtual Schedule Schedule { get; set; } = null!;


        public virtual Route Route { get; set; } = null!;


        public virtual Driver Driver { get; set; } = null!;

        public virtual ICollection<DepartureTime> DepartureTimes { get; set; } = new List<DepartureTime>();
    }

}
