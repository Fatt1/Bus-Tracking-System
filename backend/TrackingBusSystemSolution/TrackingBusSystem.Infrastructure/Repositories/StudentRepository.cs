using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class StudentRepository(AppDbContext dbContext) : IStudentRepository
    {
        public async Task<bool> AddStudentAsync(Student student)
        {
            try
            {
                await dbContext.Students.AddAsync(student);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public bool DeleteStudent(Student student)
        {
            student.IsDeleted = true;
            return true;
        }

        public Task<Student?> GetById(int id)
        {
            return dbContext.Students.Include(s => s.User).Include(s => s.Point).FirstOrDefaultAsync(s => s.Id == id);
        }

        public Task<bool> IsExistingStudent(int studentId)
        {
            throw new NotImplementedException();
        }
    }
}
