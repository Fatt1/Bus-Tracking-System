using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetScheduleToday
{
    public record GetScheduleTodayQuery(string UserId) : IQuery<GetScheduleDriverDTO>
    {
    }
    public class GetScheduleTodayQueryHandler : IQueryHandler<GetScheduleTodayQuery, GetScheduleDriverDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetScheduleTodayQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<GetScheduleDriverDTO>> Handle(GetScheduleTodayQuery request, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            var driver = await _dbContext.Drivers.Where(d => d.UserId == request.UserId).FirstOrDefaultAsync();

            var schedule = await _dbContext.Schedules.Where(s => s.ScheduleDate == today && s.DriverId == driver!.Id)
                .Select(s => new GetScheduleDriverDTO
                {
                    ScheduleId = s.Id,
                    DriverId = s.DriverId,
                    BusName = s.Bus.BusName,
                    BusId = s.BusId,
                    DropOffTime = s.DropOffTime,

                    PickupTime = s.PickupTime,
                    LastLocation = s.Bus.BusLastLocation != null ? new Buses.DTOs.BusLastLocationDTO
                    {
                        Latitude = s.Bus.BusLastLocation.Latitude,
                        Longitude = s.Bus.BusLastLocation.Longitude,

                    } : null,
                    RouteDTO = new Routes.DTOs.GetRouteDTO
                    {
                        Id = s.Route.Id,
                        RouteName = s.Route.RouteName,
                        StopPoints = s.Route.StopPoints.Select(r => new Routes.DTOs.PointResponse
                        {
                            Id = r.Id,
                            Latitude = r.Latitude,
                            Longitude = r.Longitude,
                            SequenceOrder = r.SequenceOrder
                        }).ToList(),
                    },
                    ScheduleDate = s.ScheduleDate,
                    Status = s.Status,
                    TotalStudents = _dbContext.Students.Where(st => st.Point.RouteId == s.RouteId).Count()

                }).FirstOrDefaultAsync();
            return Result<GetScheduleDriverDTO>.Success(schedule);

        }
    }
}
