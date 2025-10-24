using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class StudentCheckingHistory
    {


        public int Id { get; set; }

        public int ScheduleId { get; set; }

        public int StudentId { get; set; }

        public CheckinStatus CheckingStatus { get; set; }

        public TripDirection Type { get; set; }

        public int StopPointId { get; set; }

        public virtual Schedule Schedule { get; set; } = null!;

        public virtual StopPoint StopPoint { get; set; } = null!;

        public virtual Student Student { get; set; } = null!;

    }

}
