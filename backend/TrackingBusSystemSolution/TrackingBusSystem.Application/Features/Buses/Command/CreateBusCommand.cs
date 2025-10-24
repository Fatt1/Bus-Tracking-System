using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Command
{
    public record CreateBusCommand : ICommand<CreateBusDTO>
    {
        public string BusName { get; init; } = string.Empty;
        public string PlateNumber { get; init; } = string.Empty;

    }
    public class CreateBusCommandHandler : ICommandHandler<CreateBusCommand, CreateBusDTO>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBusRepository _busRepository;
        public CreateBusCommandHandler(IBusRepository busRepository, IUnitOfWork unitOfWork)
        {
            _busRepository = busRepository;
            _unitOfWork = unitOfWork;

        }
        public async Task<Result<CreateBusDTO>> Handle(CreateBusCommand request, CancellationToken cancellationToken)
        {
            var bus = new Bus
            {
                BusName = request.BusName,
                PlateNumber = request.PlateNumber,
                Status = Shared.Constants.BusStatus.Active
            };
            await _busRepository.AddBusAsync(bus);
            await _unitOfWork.SaveChangesAsync();
            return Result<CreateBusDTO>.Success(new CreateBusDTO
            {
                Id = bus.Id
            });
        }
    }
}
