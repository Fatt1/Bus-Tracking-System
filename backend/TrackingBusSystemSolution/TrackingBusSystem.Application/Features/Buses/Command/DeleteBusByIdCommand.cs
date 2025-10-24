using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Command
{
    public record DeleteBusByIdCommand(int Id) : ICommand
    {
    }
    public class DeleteBusByIdCommandHandler : ICommandHandler<DeleteBusByIdCommand>
    {
        private readonly IBusRepository _busRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteBusByIdCommandHandler(IBusRepository busRepository, IUnitOfWork unitOfWork)
        {
            _busRepository = busRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(DeleteBusByIdCommand request, CancellationToken cancellationToken)
        {
            DateOnly date = DateOnly.FromDateTime(DateTime.UtcNow);
            var bus = await _busRepository.GetBusByIdAsync(request.Id);
            if (bus == null)
            {
                return Result.Failure(BusErrors.BusNotFound(request.Id));
            }
            if (bus.Schedules.Any(s => s.ScheduleDate == date))
            {
                return Result.Failure(BusErrors.BusHasChedule);
            }
            _busRepository.SoftDelete(bus);
            await _unitOfWork.SaveChangesAsync();
            return Result.Success();
        }
    }
}
