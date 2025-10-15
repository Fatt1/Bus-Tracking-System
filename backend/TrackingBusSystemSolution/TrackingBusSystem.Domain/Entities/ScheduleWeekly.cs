namespace TrackingBusSystem.Domain.Entities
{
    // ----- JUNCTION & OTHER TABLES -----

    public class ScheduleWeekly
    {

        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public int ScheduleId { get; set; }

        public virtual Schedule Schedule { get; set; } = null!;
    }

}
