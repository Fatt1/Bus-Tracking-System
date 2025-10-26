using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Application.Services.Interfaces;
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
        private readonly IScheduleValidationService _scheduleValidationService;
        private readonly IScheduleRepository _scheduleRepository;


        public CreateScheduleHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork, IScheduleValidationService scheduleValidationService)
        {
            _scheduleRepository = scheduleRepository;
            _unitOfWork = unitOfWork;
            _scheduleValidationService = scheduleValidationService;
        }
        public async Task<Result<CreateScheduleDTO>> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _scheduleValidationService.ValidateScheduleAsync(request.RouteId, request.BusId, request.DriverId, request.ScheduleDate, request.DropOffTime, request.PickupTime, null, cancellationToken);

            if (!validationResult.IsSuccess)
            {
                return Result<CreateScheduleDTO>.Failure(validationResult.Error);
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (request.ScheduleDate < today)
            {
                return Result<CreateScheduleDTO>.Failure(new Error("Schedule.DateInPast", "Schedule date cannot be in the past."));
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
