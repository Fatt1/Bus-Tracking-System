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
        public int RouteId { get; init; }
    }
    public class CreateBusCommandHandler : ICommandHandler<CreateBusCommand, CreateBusDTO>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBusRepository _busRepository;
        private readonly IRouteRepository _routeRepository;
        public CreateBusCommandHandler(IBusRepository busRepository, IUnitOfWork unitOfWork, IRouteRepository routeRepository)
        {
            _busRepository = busRepository;
            _unitOfWork = unitOfWork;
            _routeRepository = routeRepository;
        }
        public async Task<Result<CreateBusDTO>> Handle(CreateBusCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra route có tồn tại chưa
            var route = await _routeRepository.GetRouteByIdAsync(request.RouteId);
            if (route == null)
            {
                return Result<CreateBusDTO>.Failure(RouteErrors.RouteNotFound(request.RouteId));
            }
            var bus = new Bus { BusName = request.BusName, PlateNumber = request.PlateNumber, RouteId = request.RouteId, Status = false };
            await _busRepository.AddBusAsync(bus);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            var busDetailDto = new CreateBusDTO
            {
                Id = bus.Id,
                BusName = bus.BusName,
                PlateNumber = bus.PlateNumber,
                RouteId = bus.RouteId,
                Status = bus.Status

            };

            return Result<CreateBusDTO>.Success(busDetailDto);

        }
    }
}
