using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.DTOs
{
    public record ScheduleWithHistoryDTO
    {
        public int Id { get; set; }
        public string BusName { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public TimeOnly PickupTime { get; set; }
        public TimeOnly DropOffTime { get; set; }
        public ScheduleStatus Status { get; set; }

        public List<StudentCheckingHistoryDTO> StudentCheckingHistories { get; set; } = new List<StudentCheckingHistoryDTO>();
    }

    public record StudentCheckingHistoryDTO
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StopPointName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
