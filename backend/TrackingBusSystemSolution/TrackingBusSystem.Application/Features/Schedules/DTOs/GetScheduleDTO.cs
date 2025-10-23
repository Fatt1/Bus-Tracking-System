using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.DTOs
{
    public record GetScheduleDTO
    {
        public int Id { get; set; }
        public string BusName { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public TimeOnly PickupTime { get; set; }
        public TimeOnly DropOffTime { get; set; }
        public ScheduleStatus Status { get; set; }


    }


}
