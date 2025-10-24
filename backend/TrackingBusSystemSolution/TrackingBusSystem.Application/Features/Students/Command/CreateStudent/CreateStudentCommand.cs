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
        // Thông tin học sinh
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Class { get; set; } = string.Empty;
        public Gender Sex { get; set; }
        public string Address { get; set; } = string.Empty;
        public int PointId { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string ParentPhoneNumber { get; set; } = string.Empty;

        // Thông tin tài khoản
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

    }

    public class CreateStudentCommandHandler : ICommandHandler<CreateStudentCommand, CreateStudentDTO>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStudentRepository _studentRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IRouteRepository _routeRepository;
        private readonly IMapper _mapper;
        public CreateStudentCommandHandler(IUnitOfWork unitOfWork, IStudentRepository studentRepository, UserManager<AppUser> userManager, IMapper mapper, IRouteRepository routeRepository)
        {
            _unitOfWork = unitOfWork;
            _studentRepository = studentRepository;
            _routeRepository = routeRepository;
            _userManager = userManager;
            _mapper = mapper;
        }
        public async Task<Result<CreateStudentDTO>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
        {

            var existingUser = await _userManager.FindByNameAsync(request.UserName);
            if (existingUser != null)
            {
                return Result<CreateStudentDTO>.Failure(new Error("User.ExistUser", "UserName has already exist"));
            }


            // Kiểm tra point có tồn tại không
            var point = await _routeRepository.IsExistPoint(request.PointId);
            if (!point)
            {
                return Result<CreateStudentDTO>.Failure(new Error("StopPoint.NotFound", "Stop point not found"));
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Tạo AppUser cho học sinh
                var appUser = new AppUser
                {
                    UserName = request.UserName,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Sex = request.Sex,
                    DateOfBirth = request.DateOfBirth,
                    PhoneNumber = request.ParentPhoneNumber

                };
                var createUserResult = await _userManager.CreateAsync(appUser, request.Password);
                if (!createUserResult.Succeeded)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return Result<CreateStudentDTO>.Failure(new Error("User.CreateFailed", "Create account failed"));
                }
                await _userManager.AddToRoleAsync(appUser, Roles.Parent.ToString());
                // Tạo Student
                var student = new Student
                {
                    UserId = appUser.Id,
                    Class = request.Class,
                    Address = request.Address,
                    ParentName = request.ParentName,
                    PointId = request.PointId,
                };
                await _studentRepository.AddStudentAsync(student);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return Result<CreateStudentDTO>.Success(_mapper.Map<CreateStudentDTO>(student));

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result<CreateStudentDTO>.Failure(new Error("Student.CreateFailed", ex.Message));
            }



        }
    }


}
