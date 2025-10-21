using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class TripStudentChecking
    {

        public long Id { get; set; }

        public CheckinStatus CheckinStatus { get; set; }

        // Foreign Keys
        public long GeneratedTripId { get; set; }
        public long StudentId { get; set; }

        // Navigation properties

        public virtual GeneratedTrip GeneratedTrip { get; set; } = null!;


        public virtual Student Student { get; set; } = null!;

    }

}
