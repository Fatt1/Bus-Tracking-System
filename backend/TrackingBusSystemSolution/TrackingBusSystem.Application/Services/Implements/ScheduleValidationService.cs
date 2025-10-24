using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Application.Services.Interfaces;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Services.Implements
{
    public class ScheduleValidationService : IScheduleValidationService
    {
        private readonly IRouteRepository _routeRepository;
        private readonly IBusRepository _busRepository;
        private readonly IDriverRepository _driverRepository;
        private readonly IScheduleRepository _scheduleRepository;

        public ScheduleValidationService(
        IRouteRepository routeRepository,
        IBusRepository busRepository,
        IDriverRepository driverRepository,
        IScheduleRepository scheduleRepository)
        {
            _routeRepository = routeRepository;
            _busRepository = busRepository;
            _driverRepository = driverRepository;
            _scheduleRepository = scheduleRepository;
        }


        public async Task<Result> ValidateScheduleAsync(int routeId, int busId, int driverId, DateOnly scheduleDate, TimeOnly dropOffTime, TimeOnly pickupTime, int? scheduleIdToIgnore = null, CancellationToken cancellationToken = default)
        {
            if (dropOffTime <= pickupTime)
            {
                return Result<CreateScheduleDTO>.Failure(new Error("Schedule.InvalidTime", "Drop off time must be after pickup time."));
            }

            // (Tùy chọn: bạn có thể gộp lỗi, nhưng check tuần tự thường OK)
            if (!await _routeRepository.IsExist(routeId))
            {
                return Result.Failure(RouteErrors.RouteNotFound(routeId));
            }

            if (!await _busRepository.IsExist(busId))
            {
                return Result.Failure(BusErrors.BusNotFound(busId));
            }

            if (!await _driverRepository.IsExist(driverId))
            {
                return Result.Failure(DriverErrors.DriverNotFound(driverId));
            }


            if (!(await _busRepository.IsBusFreeOnDate(busId, scheduleDate, scheduleIdToIgnore)))
            {
                return Result.Failure(BusErrors.BusNotAvaliable(busId, scheduleDate));
            }
            if (!(await _driverRepository.IsDriverFreeOnDate(driverId, scheduleDate, scheduleIdToIgnore)))
            {
                return Result.Failure(DriverErrors.DriverNotAvaliable(driverId, scheduleDate));
            }
            if (!(await _routeRepository.IsRouteFreeOnDate(routeId, scheduleDate, scheduleIdToIgnore)))
            {
                return Result.Failure(RouteErrors.RouteNotAvaliable(routeId, scheduleDate));
            }
            return Result.Success();
        }
    }
}
