using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class DepartureTime
    {

        public int Id { get; set; }
        public TimeSpan DepartureTimeValue { get; set; }
        public TimeSpan EstimatedArrivalTime { get; set; }
        public TripDirection Direction { get; set; }
        public int ScheduleAssignmentId { get; set; }


        public virtual ScheduleAssignment ScheduleAssignment { get; set; } = null!;
    }

}
