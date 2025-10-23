using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Buses.Command
{
    public record BusUpdateCommand : ICommand
    {
        public int Id { get; set; }

        public string BusName { get; set; } = null!;

        public string PlateNumber { get; set; } = null!;

        public BusStatus Status { get; set; }
    }

    public class BusUpdateCommandHandler : ICommandHandler<BusUpdateCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBusRepository _busRepository;

        public BusUpdateCommandHandler(IUnitOfWork unitOfWork, IBusRepository busRepository)
        {
            _unitOfWork = unitOfWork;
            _busRepository = busRepository;
        }

        public async Task<Result> Handle(BusUpdateCommand request, CancellationToken cancellationToken)
        {
            var bus = await _busRepository.GetBusByIdAsync(request.Id);
            if (bus == null)
            {
                return Result.Failure(BusErrors.BusNotFound(request.Id));
            }
            bus.BusName = request.BusName;
            bus.PlateNumber = request.PlateNumber;
            bus.Status = request.Status;
            await _unitOfWork.SaveChangesAsync();
            return Result.Success();
        }
    }
}
