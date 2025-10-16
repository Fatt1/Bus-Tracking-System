using AutoMapper;
using Microsoft.AspNetCore.Identity;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.Command.CreateDriver
{
    public record CreateDriverCommand : ICommand<GetDriverDTO>
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

    public class CreateDriverCommandHandler : ICommandHandler<CreateDriverCommand, GetDriverDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        private readonly IDriverRepository _driverRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public CreateDriverCommandHandler(IApplicationDbContext dbContext, IDriverRepository driverRepository, UserManager<AppUser> userManager, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _unitOfWork = unitOfWork;
            _driverRepository = driverRepository;
            _mapper = mapper;
        }
        public async Task<Result<GetDriverDTO>> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var username = $"{request.FullName.Replace(" ", "")}{request.DateOfBirth.Year}";
                var defaultPassword = "Driver@123";
                var newUser = new AppUser
                {
                    UserName = username,
                    Email = $"{username}@yourcompany.com",
                    FullName = request.FullName,
                };
                var createUserResult = await _userManager.CreateAsync(newUser, defaultPassword);
                if (!createUserResult.Succeeded)
                {
                    return Result<GetDriverDTO>.Failure(new Error("User. Cant create user", "Không thể tạo user"));
                }
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
                if (!createdDriver)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<GetDriverDTO>.Failure(new Error("CreateDriverFailed", "Tạo tài xế thất bại"));
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                return Result<GetDriverDTO>.Success(_mapper.Map<GetDriverDTO>(newDriver));
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<GetDriverDTO>.Failure(new Error("CreateDriverFailed", $"Tạo tài xế thất bại. Chi tiết: {ex.Message}"));
            }
            throw new NotImplementedException();
        }
    }
}
