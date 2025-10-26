using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Query
{
    public record GetStudentScheduleQuery(string UserId) : IQuery<GetStudentScheduleDTO>
    {
    }

    public class GetStudentScheduleQueryHandler : IQueryHandler<GetStudentScheduleQuery, GetStudentScheduleDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetStudentScheduleQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<GetStudentScheduleDTO>> Handle(GetStudentScheduleQuery request, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
            var student = await _dbContext.Students.Include(s => s.Point).Where(s => s.UserId == request.UserId).FirstOrDefaultAsync();
            // Implementation logic to get student schedule goes here

            var schedule = await _dbContext.Schedules.Where(s => s.ScheduleDate == today && s.RouteId == student.Point.RouteId).Select(s => new GetStudentScheduleDTO
            {
                ScheduleId = s.Id,
                ScheduleDate = s.ScheduleDate,
                RouteName = s.Route.RouteName,
                PointId = student.Point.Id,
                StopPointName = student.Point.PointName,
                RouteId = s.RouteId,
                BusId = s.BusId,
                DriverId = s.DriverId,
                PickupTime = s.PickupTime,
                DropOffTime = s.DropOffTime,
                DriverName = s.Driver.User.FirstName + " " + s.Driver.User.LastName,
                BusName = s.Bus.BusName

            }).FirstOrDefaultAsync();
            return Result<GetStudentScheduleDTO>.Success(schedule);
        }
    }
}
