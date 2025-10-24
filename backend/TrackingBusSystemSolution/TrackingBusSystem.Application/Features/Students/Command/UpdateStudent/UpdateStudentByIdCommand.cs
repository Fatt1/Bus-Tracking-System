using System.ComponentModel.DataAnnotations;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Students.Command.UpdateStudent
{
    public record UpdateStudentByIdCommand : ICommand
    {
        // Thông tin học sinh
        [Required]
        public int Id { get; set; }
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        [Required]
        public string Class { get; set; } = string.Empty;
        [Required]
        public Gender Sex { get; set; }
        [Required]
        public string Address { get; set; } = string.Empty;
        [Required]
        public int PointId { get; set; }
        [Required]
        public string ParentName { get; set; } = string.Empty;
        [Required]
        public DateOnly DateOfBirth { get; set; }
        [Required]
        public string ParentPhoneNumber { get; set; } = string.Empty;
    }

    public class UpdateStudentByIdCommandHandler : ICommandHandler<UpdateStudentByIdCommand>
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateStudentByIdCommandHandler(IStudentRepository studentRepository, IUnitOfWork unitOfWork)
        {
            _studentRepository = studentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(UpdateStudentByIdCommand request, CancellationToken cancellationToken)
        {
            var student = await _studentRepository.GetById(request.Id);
            if (student == null)
            {
                return Result<UpdateStudentByIdCommand>.Failure(StudentErrors.StudentNotFound(request.Id));
            }
            student.Address = request.Address;
            student.Class = request.Class;
            student.ParentName = request.ParentName;
            student.PointId = request.PointId;
            student.User.FirstName = request.FirstName;
            student.User.LastName = request.LastName;
            student.User.Sex = request.Sex;
            student.User.DateOfBirth = request.DateOfBirth;
            student.User.PhoneNumber = request.ParentPhoneNumber;

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();

        }
    }

}
