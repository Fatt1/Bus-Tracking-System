using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutesToday
{
    public record GetAllRoutesTodayQuery : IQuery<List<GetAllRoutesTodayDTO>>
    {
    }
    public class GetAllRoutesTodayQueryHandler : IQueryHandler<GetAllRoutesTodayQuery, List<GetAllRoutesTodayDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllRoutesTodayQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetAllRoutesTodayDTO>>> Handle(GetAllRoutesTodayQuery request, CancellationToken cancellationToken)
        {
            DateTime now = DateTime.Today;
            var allRoutesToDay = await _dbContext.ScheduleAssignments.Where(sa => sa.Schedule.StartDate.Date <= now && sa.Schedule.EndDate.Date >= now)
                .Include(sa => sa.Route)
                .ThenInclude(r => r.Points)
               .Select(sa => new GetAllRoutesTodayDTO
               {
                   Id = sa.Id,
                   RouteName = sa.Route.RouteName,
                   RouteId = sa.RouteId,
                   Points = sa.Route.Points.Select(po => new PointResponse { Id = po.Id, Latitude = po.Latitude, Longitude = po.Longitude, PointName = po.PointName }).ToList()

               }).ToListAsync();
            return Result<List<GetAllRoutesTodayDTO>>.Success(allRoutesToDay);
        }
    }
}
