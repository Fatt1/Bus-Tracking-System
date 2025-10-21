using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.Command.CreateSchedule
{
    public record CreateScheduleCommand : ICommand
    {
        public string ScheduleName { get; set; } = string.Empty;
        public ScheduleType ScheduleType { get; set; }
        public DateTime StartDate { get; set; }
        public List<DayOfWeek> DayOfWeeks { get; set; } = new();
        public ScheduleStatus Status { get; set; }
        public List<ScheduleAsignmentRequest> ScheduleAsignments { get; set; } = new();
    }
    public class CreateScheduleHandler : ICommandHandler<CreateScheduleCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRouteRepository _routeRepository;
        private readonly IDriverRepository _driverRepository;
        private readonly IScheduleRepository _scheduleRepository;

        public CreateScheduleHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork, IRouteRepository routeRepository, IDriverRepository driverRepository)
        {
            _scheduleRepository = scheduleRepository;
            _unitOfWork = unitOfWork;
            _routeRepository = routeRepository;
            _driverRepository = driverRepository;
        }
        public async Task<Result> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
        {


            var driverIds = request.ScheduleAsignments.Select(sa => sa.DriverId).Distinct().ToList();

            var existingDriversWithBuses = await _driverRepository.GetDriversWithBusByIdsAsync(driverIds);


            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var scheduleResut = Schedule.Create(request.ScheduleName, request.ScheduleType, request.StartDate, request.DayOfWeeks, request.Status);
                if (scheduleResut.IsFailure)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return Result.Failure(scheduleResut.Error);
                }
                var schedule = scheduleResut.Value;
                await _scheduleRepository.AddSchedule(schedule);
                foreach (var assignment in request.ScheduleAsignments)
                {


                    // Kiểm tra xem driver có tồn tại trong db không
                    var driverWithBus = existingDriversWithBuses.First(d => d.Id == assignment.DriverId);

                    if (driverWithBus == null)
                    {
                        await _unitOfWork.RollbackTransactionAsync();
                        return Result.Failure(DriverErrors.DriverNotFound(assignment.DriverId));
                    }

                    // Kiểm tra xem có bị trùng lịch, thời gian không


                    // 5. Nếu OK, tạo đối tượng
                    var scheduleAssignment = new ScheduleAssignment
                    {

                        RouteId = driverWithBus.Bus.RouteId,
                        DriverId = assignment.DriverId,
                        MorningDeparture = assignment.MorningDeparture,
                        MorningArrival = assignment.MorningArrival,
                        AfternoonDeparture = assignment.AfternoonDeparture,
                        AfternoonArrival = assignment.AfternoonArrival
                    }
                    ;
                    var assignmentReuslt = schedule.AddScheduleAssignment(scheduleAssignment);
                    if (assignmentReuslt.IsFailure)
                    {
                        await _unitOfWork.RollbackTransactionAsync();
                        return Result.Failure(assignmentReuslt.Error);
                    }
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                return Result.Success();
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }

        }
    }

    public record ScheduleAsignmentRequest
    {
        public int DriverId { get; set; }
        public TimeSpan MorningDeparture { get; set; }
        public TimeSpan MorningArrival { get; set; }
        public TimeSpan AfternoonDeparture { get; set; }
        public TimeSpan AfternoonArrival { get; set; }
    }
}
