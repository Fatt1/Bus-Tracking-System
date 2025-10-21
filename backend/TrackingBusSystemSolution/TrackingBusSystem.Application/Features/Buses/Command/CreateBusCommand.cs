using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Command
{
    public record CreateBusCommand : ICommand<GetBusDetailDTO>
    {
        public string BusName { get; init; } = string.Empty;
        public string PlateNumber { get; init; } = string.Empty;
    }
    public class CreateBusCommandHandler : ICommandHandler<CreateBusCommand, GetBusDetailDTO>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBusRepository _busRepository;
        public CreateBusCommandHandler(IBusRepository busRepository, IUnitOfWork unitOfWork)
        {
            _busRepository = busRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result<GetBusDetailDTO>> Handle(CreateBusCommand request, CancellationToken cancellationToken)
        {
            var bus = new Bus { BusName = request.BusName, PlateNumber = request.PlateNumber };
            await _busRepository.AddBusAsync(bus);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            var busDetailDto = new GetBusDetailDTO
            {
                Id = bus.Id,
                BusName = bus.BusName,
                PlateNumber = bus.PlateNumber,
            };

            return Result<GetBusDetailDTO>.Success(busDetailDto);

        }
    }
}
