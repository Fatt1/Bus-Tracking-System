using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Query.GetStudentById
{
    public record GetStudentByIdQuery(int Id) : IQuery<GetStudentDTO>
    {
    }
    public class GetStudentByIdQueryHandler : IQueryHandler<GetStudentByIdQuery, GetStudentDTO>
    {
        private readonly IApplicationDbContext _applicationDbContext;
        public GetStudentByIdQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }
        public async Task<Result<GetStudentDTO>> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
        {
            var student = await _applicationDbContext.Students.Where(s => s.Id == request.Id)
                 .Select(s => new GetStudentDTO
                 {
                     Id = s.Id,
                     FirstName = s.User.FirstName,
                     LastName = s.User.LastName,
                     Class = s.Class,
                     Address = s.Address,
                     ParentName = s.ParentName,
                     DateOfBirth = s.User.DateOfBirth,
                     ParentPhoneNumber = s.User.PhoneNumber!,
                     StopPointId = s.Point.Id,
                     StopPointName = s.Point.PointName,
                     RouteId = s.Point.Route.Id,
                     RouteName = s.Point.Route.RouteName,
                     Sex = s.User.Sex,
                     UserName = s.User.UserName!,
                     Password = "" // Passwords are not retrievable for security reasons
                 }).FirstOrDefaultAsync();
            if (student == null)
            {
                return Result<GetStudentDTO>.Failure(StudentErrors.StudentNotFound(request.Id));
            }
            return Result<GetStudentDTO>.Success(student);
        }
    }
}
