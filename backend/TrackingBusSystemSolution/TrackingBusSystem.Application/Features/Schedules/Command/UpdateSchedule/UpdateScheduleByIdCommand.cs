using AutoMapper;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.Command.UpdateSchedule
{
    public record UpdateScheduleByIdCommand() : ICommand
    {
        public int Id { get; set; }

        public DateOnly ScheduleDate { get; set; }

        public int DriverId { get; set; }

        public int BusId { get; set; }

        public int RouteId { get; set; }

        public TimeOnly PickupTime { get; set; }

        public TimeOnly DropOffTime { get; set; }

        public ScheduleStatus Status { get; set; }
    }
    public class UpdateScheduleByIdCommandHandler : ICommandHandler<UpdateScheduleByIdCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IMapper _mapper;

        public UpdateScheduleByIdCommandHandler(IUnitOfWork unitOfWork, IScheduleRepository scheduleRepository, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _scheduleRepository = scheduleRepository;
            _mapper = mapper;
        }
        public async Task<Result> Handle(UpdateScheduleByIdCommand request, CancellationToken cancellationToken)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
            if (schedule == null)
            {
                return Result.Failure(ScheduleErrors.ScheduleNotFound);
            }
            if (schedule.Status != ScheduleStatus.InActive)
            {
                return Result.Failure(ScheduleErrors.ScheduleCannotBeDeleted);
            }
            _mapper.Map(request, schedule);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
