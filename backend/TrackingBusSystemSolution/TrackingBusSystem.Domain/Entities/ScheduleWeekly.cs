namespace TrackingBusSystem.Domain.Entities
{
    // ----- JUNCTION & OTHER TABLES -----

    public class ScheduleWeekly
    {

        public int Id { get; private set; }
        public DayOfWeek DayOfWeek { get; private set; }
        public int ScheduleId { get; private set; }

        public virtual Schedule Schedule { get; set; } = null!;

        private ScheduleWeekly()
        {
            // For EF
        }
        public ScheduleWeekly(DayOfWeek dayOfWeek)
        {
            DayOfWeek = dayOfWeek;
        }
    }

}
