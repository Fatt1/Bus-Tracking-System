using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Command.DeleteStudent
{
    public record DeleteStudentByIdCommand(int Id) : ICommand
    {

    }
    public class DeleteStudentByIdHandler : ICommandHandler<DeleteStudentByIdCommand>
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteStudentByIdHandler(IStudentRepository studentRepository, IUnitOfWork unitOfWork)
        {
            _studentRepository = studentRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(DeleteStudentByIdCommand request, CancellationToken cancellationToken)
        {
            var student = await _studentRepository.GetById(request.Id);
            if (student == null)
            {
                return Result.Failure(StudentErrors.StudentNotFound(request.Id));
            }
            _studentRepository.DeleteStudent(student);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
