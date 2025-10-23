using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.Command.CreateSchedule
{
    public record CreateScheduleCommand : ICommand<CreateScheduleDTO>
    {
        public DateOnly ScheduleDate { get; set; }

        public int DriverId { get; set; }

        public int BusId { get; set; }

        public int RouteId { get; set; }

        public TimeOnly PickupTime { get; set; }

        public TimeOnly DropOffTime { get; set; }


    }
    public class CreateScheduleHandler : ICommandHandler<CreateScheduleCommand, CreateScheduleDTO>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRouteRepository _routeRepository;
        private readonly IDriverRepository _driverRepository;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IBusRepository _busRepository;

        public CreateScheduleHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork, IRouteRepository routeRepository, IDriverRepository driverRepository, IBusRepository busRepository)
        {
            _scheduleRepository = scheduleRepository;
            _unitOfWork = unitOfWork;
            _routeRepository = routeRepository;
            _driverRepository = driverRepository;
            _busRepository = busRepository;
        }
        public async Task<Result<CreateScheduleDTO>> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
        {
            var existingRoute = await _routeRepository.IsExist(request.RouteId);
            if (!existingRoute)
            {
                return Result<CreateScheduleDTO>.Failure(RouteErrors.RouteNotFound(request.RouteId));
            }
            var existingBus = await _busRepository.IsExist(request.BusId);
            if (!existingBus)
            {
                return Result<CreateScheduleDTO>.Failure(BusErrors.BusNotFound(request.BusId));
            }

            var existingDriver = await _driverRepository.IsExist(request.DriverId);
            if (!existingDriver)
            {
                return Result<CreateScheduleDTO>.Failure(DriverErrors.DriverNotFound(request.DriverId));
            }

            var schedule = new Schedule
            {
                ScheduleDate = request.ScheduleDate,
                DriverId = request.DriverId,
                BusId = request.BusId,
                RouteId = request.RouteId,
                PickupTime = request.PickupTime,
                DropOffTime = request.DropOffTime,
                Status = ScheduleStatus.InActive,
            };

            await _scheduleRepository.AddSchedule(schedule);
            await _unitOfWork.SaveChangesAsync();
            return Result<CreateScheduleDTO>.Success(new CreateScheduleDTO { Id = schedule.Id });
        }
    }


}
