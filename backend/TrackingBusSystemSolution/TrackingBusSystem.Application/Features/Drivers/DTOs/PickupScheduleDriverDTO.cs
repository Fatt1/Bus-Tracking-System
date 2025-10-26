namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record PickupScheduleDriverDTO
    {
        public int ScheduleId { get; init; }
        public int Id { get; init; }
        public string StudentName { get; init; } = string.Empty;
        public string Class { get; init; } = string.Empty;

        public int StopPointId { get; init; }
        public string StopPointName { get; init; } = string.Empty;

        public string ParentName { get; init; } = string.Empty;
        public string ParentPhoneNumber { get; init; } = string.Empty;
    }

    public record PickUpStudentScheduleDTO
    {

    }
}
