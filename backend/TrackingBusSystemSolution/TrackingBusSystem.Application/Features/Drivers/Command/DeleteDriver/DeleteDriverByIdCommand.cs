using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Command.DeleteDriver
{
    public record DeleteDriverByIdCommand(int Id) : ICommand
    {
    }
    public class DeleteDriverByIdCommandHandler : ICommandHandler<DeleteDriverByIdCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDriverRepository _driverRepository;
        public DeleteDriverByIdCommandHandler(IUnitOfWork unitOfWork, IDriverRepository driverRepository)
        {
            _unitOfWork = unitOfWork;
            _driverRepository = driverRepository;
        }
        public async Task<Result> Handle(DeleteDriverByIdCommand request, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
            var driver = await _driverRepository.GetDriverById(request.Id);
            if (driver == null)
            {
                return Result.Failure(DriverErrors.DriverNotFound(request.Id));
            }
            if (driver.Schedules.Any(s => s.ScheduleDate >= today))
            {
                return Result.Failure(new Error("Driver.HasSchedule", "Cannot delete driver with upcoming or today schedules."));
            }
            _driverRepository.SoftDelete(driver);
            await _unitOfWork.SaveChangesAsync();
            return Result.Success();
        }
    }
}
