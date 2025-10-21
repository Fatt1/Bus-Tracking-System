using AutoMapper;
using Microsoft.AspNetCore.Identity;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Students.Command.CreateStudent
{
    public class CreateStudentCommand : ICommand<CreateStudentDTO>
    {

        public string Class { get; set; } = string.Empty;


        public string Address { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }
        public string ParentName { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string ParentPhoneNumber { get; set; } = string.Empty;

        public Gender Sex { get; set; }
        public int PointId { get; set; }
        public int DriverId { get; set; }
    }

    public class CreateStudentCommandHandler : ICommandHandler<CreateStudentCommand, CreateStudentDTO>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStudentRepository _studentRepository;
        private readonly IDriverRepository _driverRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;
        public CreateStudentCommandHandler(IUnitOfWork unitOfWork, IStudentRepository studentRepository, IDriverRepository driverRepository, UserManager<AppUser> userManager, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _studentRepository = studentRepository;
            _driverRepository = driverRepository;
            _userManager = userManager;
            _mapper = mapper;
        }
        public async Task<Result<CreateStudentDTO>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
        {
            var existsDriver = await _driverRepository.GetDriverById(request.DriverId);
            if (existsDriver == null)
            {
                return Result<CreateStudentDTO>.Failure(DriverErrors.DriverNotFound(request.DriverId));
            }
            try
            {
                await _unitOfWork.BeginTransactionAsync(cancellationToken);
                // Tạo tài khoản cho hs trước
                var username = request.ParentPhoneNumber;
                // Tạo user mới với vai trò "Driver"
                var defaultPassword = "Student@123";
                var newUser = new AppUser
                {
                    UserName = username,
                    Email = $"{username}@yourcompany.com",
                    FullName = request.FullName,
                    PhoneNumber = request.ParentPhoneNumber,
                };
                var createUserResult = await _userManager.CreateAsync(newUser, defaultPassword);

                // Kiểm tra xem việc tạo user có thành công không
                if (!createUserResult.Succeeded)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<CreateStudentDTO>.Failure(new Error("User. Cant create user", "Không thể tạo user"));
                }
                // Gán vai trò "Driver" cho user mới tạo
                await _userManager.AddToRoleAsync(newUser, Roles.Parent.ToString());
                var student = new Student
                {
                    Address = request.Address,
                    Class = request.Class,
                    DateOfBirth = request.DateOfBirth,
                    ParentName = request.ParentName,
                    ParentPhoneNumber = request.ParentPhoneNumber,
                    DriverId = request.DriverId,
                    PointId = request.PointId,
                    UserId = newUser.Id,
                    Sex = request.Sex,
                };
                await _studentRepository.AddStudentAsync(student);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                return Result<CreateStudentDTO>.Success(_mapper.Map<CreateStudentDTO>(student));
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<CreateStudentDTO>.Failure(new Error("CreateDriverFailed", $"Tạo học sinh thất bại Chi tiết: {ex.Message}"));
            }

        }
    }


}
