using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class Schedule
    {
        public int Id { get; set; }

        public DateOnly ScheduleDate { get; set; }

        public int DriverId { get; set; }

        public int BusId { get; set; }

        public int RouteId { get; set; }

        public TimeOnly PickupTime { get; set; }

        public TimeOnly DropOffTime { get; set; }

        public ScheduleStatus Status { get; set; }

        public virtual Bus Bus { get; set; } = null!;

        public virtual Driver Driver { get; set; } = null!;

        public virtual Route Route { get; set; } = null!;

        public virtual ICollection<StudentCheckingHistory> StudentCheckingHistories { get; set; } = new List<StudentCheckingHistory>();

    }



    public static class ScheduleErrors
    {
        public static Error DuplicateAssignment => new Error("Schedule.DuplicateAssignment", "This route and driver assignment already exists in the schedule.");
        public static Error DriverAlreadyAssigned => new Error("Schedule.DriverAlreadyAssigned", "This driver is already assigned to another route in the schedule.");
        public static Error ScheduleNotFound => new Error("Schedule.NotFound", "Schedule not found");
        public static Error ScheduleCannotBeDeleted => new Error("Schedule.CannotBeDeleted", "Only inactive schedules can be deleted.");

    }
}
