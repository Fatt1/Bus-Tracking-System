using AutoMapper;
using Microsoft.AspNetCore.Identity;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.Command.CreateDriver
{
    public record CreateDriverCommand : ICommand<CreateDriverDTO>
    {
        public string PhoneNumber { get; init; } = string.Empty;

        public DateTime DateOfBirth { get; init; }

        public string IDCard { get; init; } = string.Empty;

        public string FullName { get; init; } = string.Empty;

        public string Address { get; init; } = string.Empty;

        public Gender Sex { get; init; }

        // Foreign Keys
        public int BusId { get; init; }
    }

    public class CreateDriverCommandHandler : ICommandHandler<CreateDriverCommand, CreateDriverDTO>
    {
        private readonly IBusRepository _busRepository;
        private readonly IDriverRepository _driverRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public CreateDriverCommandHandler(IDriverRepository driverRepository, UserManager<AppUser> userManager, IUnitOfWork unitOfWork, IMapper mapper, IBusRepository busRepository)
        {
            _userManager = userManager;
            _busRepository = busRepository;
            _unitOfWork = unitOfWork;
            _driverRepository = driverRepository;
            _mapper = mapper;
        }
        public async Task<Result<CreateDriverDTO>> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra xem xe buýt có tồn tại hay chưa

            var busExists = await _busRepository.IsExistingBus(request.BusId);

            if (!busExists)
            {
                return Result<CreateDriverDTO>.Failure(BusErrors.BusNotFound(request.BusId));
            }

            // Kiểm tra xem bus đã có tài xế chưa

            var isBusAssigned = await _driverRepository.IsDriverAssignedToBusAsync(request.BusId);
            if (isBusAssigned)
            {
                return Result<CreateDriverDTO>.Failure(DriverErrors.BusAlreadyHasDriver);
            }


            // Kiểm tra xem số điện thoại đã được sử dụng hay chưa
            var userResult = await _userManager.FindByNameAsync(request.PhoneNumber);
            if (userResult != null)
            {
                return Result<CreateDriverDTO>.Failure(DriverErrors.PhoneNumberAlreadyInUse(request.PhoneNumber));
            }

            // Tạo user và tài xế trong một transaction
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var username = request.PhoneNumber;
                // Tạo user mới với vai trò "Driver"
                var defaultPassword = "Driver@123";
                var newUser = new AppUser
                {
                    UserName = username,
                    Email = $"{username}@yourcompany.com",
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                };
                var createUserResult = await _userManager.CreateAsync(newUser, defaultPassword);

                // Kiểm tra xem việc tạo user có thành công không
                if (!createUserResult.Succeeded)
                {
                    return Result<CreateDriverDTO>.Failure(new Error("User. Cant create user", "Không thể tạo user"));
                }
                // Gán vai trò "Driver" cho user mới tạo
                await _userManager.AddToRoleAsync(newUser, Roles.Driver.ToString());
                var newDriver = new Driver
                {
                    UserId = newUser.Id,
                    PhoneNumber = request.PhoneNumber,
                    DateOfBirth = request.DateOfBirth,
                    IDCard = request.IDCard,
                    Address = request.Address,
                    Sex = request.Sex,
                    BusId = request.BusId

                };
                var createdDriver = await _driverRepository.AddDriver(newDriver);
                await _busRepository.UpdateBusStatusById(request.BusId, true);
                // Kiểm tra xem việc tạo tài xế có thành công không
                if (!createdDriver)
                {
                    // Nếu không thành công thì rollback transaction và trả về lỗi
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<CreateDriverDTO>.Failure(new Error("CreateDriverFailed", "Tạo tài xế thất bại"));
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                return Result<CreateDriverDTO>.Success(_mapper.Map<CreateDriverDTO>(newDriver));
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<CreateDriverDTO>.Failure(new Error("CreateDriverFailed", $"Tạo tài xế thất bại. Chi tiết: {ex.Message}"));
            }

        }
    }
}
