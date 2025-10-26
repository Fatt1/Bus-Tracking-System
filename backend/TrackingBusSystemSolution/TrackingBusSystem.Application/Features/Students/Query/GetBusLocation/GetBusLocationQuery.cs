using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Query.GetBusLocation
{
    public record GetBusLocationQuery(string UserId) : IQuery<GetBusLocationDTO>
    {
    }
    public class GetBusLocationQueryHandler : IQueryHandler<GetBusLocationQuery, GetBusLocationDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetBusLocationQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<GetBusLocationDTO>> Handle(GetBusLocationQuery request, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            var student = await _dbContext.Students.Include(s => s.Point).Where(s => s.UserId == request.UserId).FirstOrDefaultAsync();
            var busLocation = await _dbContext.Schedules.Where(s => s.ScheduleDate == today && s.RouteId == student.Point.RouteId)
                .Select(s => new GetBusLocationDTO
                {
                    BusId = s.BusId,
                    Latitude = s.Bus.BusLastLocation.Latitude,
                    Longitude = s.Bus.BusLastLocation.Longitude,
                    BusName = s.Bus.BusName,
                    RouteDTO = new Features.Routes.DTOs.GetRouteDTO
                    {
                        Id = s.Route.Id,
                        RouteName = s.Route.RouteName,
                        StopPoints = s.Route.StopPoints.Select(sp => new Features.Routes.DTOs.PointResponse
                        {
                            Id = sp.Id,
                            Latitude = sp.Latitude,
                            Longitude = sp.Longitude,
                            PointName = sp.PointName,
                            SequenceOrder = sp.SequenceOrder

                        }).ToList()
                    }

                }).FirstOrDefaultAsync();
            return Result<GetBusLocationDTO>.Success(busLocation);


        }
    }
}
