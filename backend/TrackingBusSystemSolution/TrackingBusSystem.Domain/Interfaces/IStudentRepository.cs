using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IStudentRepository
    {
        Task<bool> IsExistingStudent(int studentId);
        Task<bool> AddStudentAsync(Student student);

    }
}
