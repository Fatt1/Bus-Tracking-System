using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Services.Interfaces
{
    public interface IScheduleValidationService
    {
        // Kiểm tra các ID có tồn tại không
        Task<Result> ValidateScheduleAsync(
          int routeId, int busId, int driverId, DateOnly scheduleDate, TimeOnly dropOffTime, TimeOnly pickupTime, int? scheduleIdToIgnore = null, CancellationToken cancellationToken = default);


    }
}
