using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.Command.UpdateDriver
{
    public record UpdateDriverByIdCommand : ICommand
    {
        public int Id { get; set; }
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string IDCard { get; init; } = string.Empty;
        public string PhoneNumber { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public DateOnly DateOfBirth { get; init; }
        public Gender Sex { get; init; }
        public DriverStatus Status { get; init; }

    }
    public class UpdateDriverByIdCommandHandler : ICommandHandler<UpdateDriverByIdCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDriverRepository _driverRepository;

        public UpdateDriverByIdCommandHandler(IUnitOfWork unitOfWork, IDriverRepository driverRepository)
        {
            _unitOfWork = unitOfWork;
            _driverRepository = driverRepository;
        }

        public async Task<Result> Handle(UpdateDriverByIdCommand request, CancellationToken cancellationToken)
        {
            var driver = await _driverRepository.GetDriverById(request.Id);
            if (driver == null)
            {
                return Result.Failure(DriverErrors.DriverNotFound(request.Id));
            }
            driver.User.FirstName = request.FirstName;
            driver.User.LastName = request.LastName;
            driver.User.PhoneNumber = request.PhoneNumber;
            driver.User.DateOfBirth = request.DateOfBirth;
            driver.Status = request.Status;
            driver.Address = request.Address;
            driver.Idcard = request.IDCard;
            driver.User.Sex = request.Sex;

            await _unitOfWork.SaveChangesAsync();
            return Result.Success();
        }
    }

}
