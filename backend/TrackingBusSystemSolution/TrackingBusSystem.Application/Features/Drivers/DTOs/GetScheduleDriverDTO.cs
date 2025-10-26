using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record GetScheduleDriverDTO
    {
        public int ScheduleId { get; set; }
        public DateOnly ScheduleDate { get; set; }
        public int DriverId { get; set; }
        public int BusId { get; set; }
        public string BusName { get; set; } = string.Empty;
        public GetRouteDTO RouteDTO { get; set; } = new GetRouteDTO();
        public int TotalStudents { get; set; }
        public TimeOnly PickupTime { get; set; }
        public BusLastLocationDTO? LastLocation { get; set; }
        public TimeOnly DropOffTime { get; set; }
        public ScheduleStatus Status { get; set; }


    }
}
