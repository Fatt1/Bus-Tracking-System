using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record CompleTripStudentsDTO
    {
        public int ScheduleId { get; set; }

        public int StudentId { get; set; }

        public CheckinStatus CheckingStatus { get; set; }

        public TripDirection Type { get; set; }

        public int StopPointId { get; set; }
    }
}
