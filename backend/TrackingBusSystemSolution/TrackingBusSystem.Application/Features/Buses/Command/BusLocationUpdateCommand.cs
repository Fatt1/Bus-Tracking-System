using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Command
{
    public class BusLocationUpdateCommand : ICommand
    {
        public int BusId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
    public class BusLocationUpdateHandler : ICommandHandler<BusLocationUpdateCommand>
    {
        private readonly IBusRepository _busRepository;
        private readonly IUnitOfWork _unitOfWork;
        public BusLocationUpdateHandler(IBusRepository busRepository, IUnitOfWork unitOfWork)
        {
            _busRepository = busRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(BusLocationUpdateCommand request, CancellationToken cancellationToken)
        {
            var busExists = await _busRepository.IsExist(request.BusId);
            if (!busExists)
            {
                return Result.Failure(BusErrors.BusNotFound(request.BusId));
            }

            await _busRepository.UpdateLastLocation(request.BusId, request.Latitude, request.Longitude);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
