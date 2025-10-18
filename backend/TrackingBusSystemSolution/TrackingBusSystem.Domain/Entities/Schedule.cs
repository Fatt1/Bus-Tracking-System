using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class Schedule
    {
        internal List<ScheduleWeekly> _scheduleWeeklies = new();
        internal List<ScheduleAssignment> _scheduleAssignments = new();
        public int Id { get; set; }

        public string ScheduleName { get; private set; } = string.Empty;

        public ScheduleType ScheduleType { get; private set; }

        public DateTime StartDate { get; private set; }
        public DateTime EndDate { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public ScheduleStatus Status { get; private set; }

        // Navigation properties
        public virtual ICollection<ScheduleWeekly> ScheduleWeeklies => _scheduleWeeklies.AsReadOnly();
        public virtual ICollection<ScheduleAssignment> ScheduleAssignments => _scheduleAssignments.AsReadOnly();
        public virtual ICollection<GeneratedTrip> GeneratedTrips { get; set; } = new List<GeneratedTrip>();



        public static Result<Schedule> Create(string scheduleName, ScheduleType scheduleType, DateTime startDate, List<DayOfWeek> dayOfWeeks, ScheduleStatus status)
        {
            if (dayOfWeeks.Count == 0 && (scheduleType == ScheduleType.Weekly || scheduleType == ScheduleType.Monthly))
            {
                return Result<Schedule>.Failure(new Error("Schedule.InvalidDayOfWeeks", "At least one day of week must be selected for weekly or monthly schedule."));
            }
            // Nếu là fixed date thì chỉ được chọn 1 ngày trong tuần
            if (dayOfWeeks.Count > 1 && scheduleType == ScheduleType.FixedDate)
            {
                return Result<Schedule>.Failure(new Error("Schedule.InvalidDayOfWeeks", "Only one day of week can be selected for fixed date schedule."));
            }

            var endDate = scheduleType switch
            {
                ScheduleType.Weekly => startDate.AddDays(6),
                ScheduleType.FixedDate => startDate.AddDays(1),
                ScheduleType.Monthly => startDate.AddMonths(1).AddDays(-1),
                _ => startDate
            };
            var schedule = new Schedule()
            {
                Status = status,
                ScheduleName = scheduleName,
                ScheduleType = scheduleType,
                StartDate = startDate,
                EndDate = endDate

            };
            schedule.UpdateWeeklyDays(dayOfWeeks);
            return Result<Schedule>.Success(schedule);
        }

        public Result AddScheduleAssignment(ScheduleAssignment scheduleAssignment)
        {
            // Check for duplicate assignment
            if (_scheduleAssignments.Any(sa => sa.RouteId == scheduleAssignment.RouteId && sa.DriverId == scheduleAssignment.DriverId))
            {
                return Result.Failure(ScheduleErrors.DuplicateAssignment);
            }
            // Kiểm tra xem tài xế đã đc phân công trong tuyến nào chưa
            if (_scheduleAssignments.Any(sa => sa.DriverId == scheduleAssignment.DriverId))
            {
                return Result.Failure(ScheduleErrors.DriverAlreadyAssigned);
            }
            _scheduleAssignments.Add(scheduleAssignment);
            return Result.Success();
        }
        public void AddScheduleAssignment(List<ScheduleAssignment> scheduleAssignments)
        {
            // Check for duplicate assignment

            _scheduleAssignments.AddRange(scheduleAssignments);
        }
        public Result UpdateWeeklyDays(List<DayOfWeek> dayOfWeeks)
        {
            _scheduleWeeklies.Clear();
            foreach (var day in dayOfWeeks)
            {
                _scheduleWeeklies.Add(new ScheduleWeekly(day));

            }
            return Result.Success();
        }
        private Schedule()
        {
            // For EF
        }

    }

    public static class ScheduleErrors
    {
        public static Error DuplicateAssignment => new Error("Schedule.DuplicateAssignment", "This route and driver assignment already exists in the schedule.");
        public static Error DriverAlreadyAssigned => new Error("Schedule.DriverAlreadyAssigned", "This driver is already assigned to another route in the schedule.");


    }
}
