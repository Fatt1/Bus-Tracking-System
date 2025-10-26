using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Query.GetAllStudentsWithoutPagination
{
    public record GetAllStudentWithoutPaginationQuery : IQuery<List<StudentWithoutPaginationDTO>>
    {
    }
    public class GetAllStudentWithoutPaginationQueryHandler : IQueryHandler<GetAllStudentWithoutPaginationQuery, List<StudentWithoutPaginationDTO>>
    {
        private readonly IApplicationDbContext _applicationDbContext;
        public GetAllStudentWithoutPaginationQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }
        public async Task<Result<List<StudentWithoutPaginationDTO>>> Handle(GetAllStudentWithoutPaginationQuery request, CancellationToken cancellationToken)
        {
            var students = await _applicationDbContext.Students.Select(s => new StudentWithoutPaginationDTO
            {
                StudentId = s.Id,
                FullName = s.User.LastName + " " + s.User.FirstName,
                UserId = s.UserId,
                Class = s.Class
            }).ToListAsync();
            return Result<List<StudentWithoutPaginationDTO>>.Success(students);
        }
    }
}
