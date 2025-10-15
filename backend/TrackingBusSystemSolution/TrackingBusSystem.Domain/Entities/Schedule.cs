using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class Schedule
    {

        public int Id { get; set; }

        public string ScheduleName { get; set; } = string.Empty;

        public ScheduleType ScheduleType { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // Navigation properties
        public virtual ICollection<ScheduleWeekly> ScheduleWeeklies { get; set; } = new List<ScheduleWeekly>();
        public virtual ICollection<ScheduleAssignment> ScheduleAssignments { get; set; } = new List<ScheduleAssignment>();
        public virtual ICollection<GeneratedTrip> GeneratedTrips { get; set; } = new List<GeneratedTrip>();
    }

}
