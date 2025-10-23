using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Query.GetAllStudentByRouteId
{
    public record GetAllStudentByRouteIdQuery(int RouteId) : IQuery<List<GetAllStudentByRouteIdDTO>>
    {
    }
    public class GetAllStudentByRouteIdQueryHandler : IQueryHandler<GetAllStudentByRouteIdQuery, List<GetAllStudentByRouteIdDTO>>
    {
        private readonly IApplicationDbContext _applicationDbContext;
        public GetAllStudentByRouteIdQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }
        public async Task<Result<List<GetAllStudentByRouteIdDTO>>> Handle(GetAllStudentByRouteIdQuery request, CancellationToken cancellationToken)
        {
            var allStudent = await _applicationDbContext.Students.Where(s => s.Point.RouteId == request.RouteId)
              .OrderBy(s => s.User.FirstName)
              .Select(s => new GetAllStudentByRouteIdDTO
              {
                  FullName = s.User.LastName + " " + s.User.FirstName,
                  StopPointName = s.Point.PointName
              }).ToListAsync();

            return Result<List<GetAllStudentByRouteIdDTO>>.Success(allStudent);
        }
    }
}
