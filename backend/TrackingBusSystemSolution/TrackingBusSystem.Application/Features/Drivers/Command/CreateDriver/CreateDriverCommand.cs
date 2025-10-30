using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
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
        [Required]
        public string FirstName { get; init; } = string.Empty;
        [Required]
        public string LastName { get; init; } = string.Empty;

        [Required]
        public string IDCard { get; init; } = string.Empty;
        [Phone]
        public string PhoneNumber { get; init; } = string.Empty;
        [Required]
        public string Address { get; init; } = string.Empty;
        [Required]
        public DateOnly DateOfBirth { get; init; }
        [Required]
        public Gender Sex { get; init; }

        //Tài khoản 
        [Required]
        public string UserName { get; init; } = string.Empty;
        [Required]
        public string Password { get; init; } = string.Empty;
    }

    public class CreateDriverCommandHandler : ICommandHandler<CreateDriverCommand, CreateDriverDTO>
    {
        private readonly IDriverRepository _driverRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        public CreateDriverCommandHandler(IDriverRepository driverRepository, UserManager<AppUser> userManager, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;

            _unitOfWork = unitOfWork;
            _driverRepository = driverRepository;

        }
        public async Task<Result<CreateDriverDTO>> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
        {
            var existingUser = await _userManager.FindByNameAsync(request.UserName);
            if (existingUser != null)
            {
                return Result<CreateDriverDTO>.Failure(new Error("User.ExistUser", "UserName has already exist"));
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var appUser = new AppUser
                {
                    UserName = request.UserName,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    DateOfBirth = request.DateOfBirth,
                    PhoneNumber = request.PhoneNumber
                };
                var createUserResult = await _userManager.CreateAsync(appUser, request.Password);
                if (!createUserResult.Succeeded)
                {
                    await _unitOfWork.RollbackTransactionAsync();

                    return Result<CreateDriverDTO>.Failure(new Error("User.CreateFailed", $"Creating user failed"));
                }
                await _userManager.AddToRoleAsync(appUser, Roles.Driver.ToString());
                var driver = new Driver
                {
                    Address = request.Address,
                    UserId = appUser.Id,
                    Idcard = request.IDCard,
                    Status = DriverStatus.Available
                };
                await _driverRepository.AddDriver(driver);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                return Result<CreateDriverDTO>.Success(new CreateDriverDTO
                {
                    Id = driver.Id,
                });
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result<CreateDriverDTO>.Failure(new Error("Driver.CreateFailed", $"Creating driver failed: {ex.Message}"));
            }
        }
    }
}
