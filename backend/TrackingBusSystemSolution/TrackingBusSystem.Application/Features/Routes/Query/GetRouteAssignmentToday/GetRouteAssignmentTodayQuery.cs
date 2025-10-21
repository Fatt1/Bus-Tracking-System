using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetRouteAssignmentToday
{
    public record GetRouteAssignmentTodayQuery(int RouteId) : IQuery<List<GetRouteAssignmentTodayDTO>>
    {
    }
    public class GetRouteAssignmentTodayQueryHandler : IQueryHandler<GetRouteAssignmentTodayQuery, List<GetRouteAssignmentTodayDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetRouteAssignmentTodayQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetRouteAssignmentTodayDTO>>> Handle(GetRouteAssignmentTodayQuery request, CancellationToken cancellationToken)
        {
            DateTime now = DateTime.Today;
            var routeSchedules = await _dbContext.ScheduleAssignments.Where(sa => sa.RouteId == request.RouteId && sa.Schedule.StartDate.Date <= now && now <= sa.Schedule.EndDate.Date)
                 .Select(sa => new GetRouteAssignmentTodayDTO
                 {
                     RouteId = sa.Id,
                     RouteName = sa.Route.RouteName,
                     AssignmentId = sa.Id,
                     ScheduleId = sa.ScheduleId,
                     ScheduleName = sa.Schedule.ScheduleName,
                     DriverName = sa.Driver.User.FullName,
                     DriverId = sa.DriverId,
                     BusId = sa.Driver.BusId,
                     BusName = sa.Driver.Bus.BusName,
                 }).ToListAsync();

            return Result<List<GetRouteAssignmentTodayDTO>>.Success(routeSchedules);
        }
    }
}
