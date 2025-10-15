using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    // ----- TRIP & CHECKING ENTITIES -----

    public class GeneratedTrip
    {
        public long Id { get; set; }

        public DateTime TripDate { get; set; }
        public TimeSpan DepartureTime { get; set; }
        public TimeSpan EstimatedArrivalTime { get; set; }
        public TripDirection Direction { get; set; }
        public TripStatus Status { get; set; }

        // Foreign Keys
        public int ScheduleId { get; set; }
        public int DriverId { get; set; }
        public int RouteId { get; set; }

        public virtual Schedule Schedule { get; set; } = null!;


        public virtual Driver Driver { get; set; } = null!;

        public virtual Route Route { get; set; } = null!;

        public virtual ICollection<TripStudentChecking> StudentCheckings { get; set; } = new List<TripStudentChecking>();
    }

}
