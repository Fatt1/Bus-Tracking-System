using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetAssigmentRoute
{
    public record GetAssigmentRouteQuery(int RouteId) : IQuery<GetAssigmentRouteDTO>
    {
    }
    public class GetAssigmentRouteQueryHandler : IQueryHandler<GetAssigmentRouteQuery, GetAssigmentRouteDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAssigmentRouteQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<GetAssigmentRouteDTO>> Handle(GetAssigmentRouteQuery request, CancellationToken cancellationToken)
        {
            var detailRoute = await _dbContext.Routes
             .AsNoTracking()
             .Where(route => route.Id == request.RouteId) // <-- 1. LỌC NGAY TỪ ĐẦU
             .Select(route => new GetAssigmentRouteDTO
             {
                 Id = route.Id,
                 RouteName = route.RouteName,
                 Points = route.Points.Select(p => new PointResponse
                 {
                     Id = p.Id,
                     Latitude = p.Latitude,
                     Longitude = p.Longitude,
                     PointName = p.PointName
                 }).ToList(),

                 DriverAssigmentRoutes = route.Buses
                                         .Where(bus => bus.Driver != null) // Đảm bảo xe buýt có tài xế
                                         .Select(bus => new DriverAssigmentRoute
                                         {
                                             BusId = bus.Id,
                                             BusName = bus.BusName,
                                             DriverId = bus.Driver.Id,
                                             DriverName = bus.Driver.User.FullName
                                         }).ToList()
             })
             .FirstOrDefaultAsync(cancellationToken); // <-- Dùng FirstOrDefaultAsync ở cuối cùng
            if (detailRoute == null)
            {
                return Result<GetAssigmentRouteDTO>.Failure(RouteErrors.RouteNotFound(request.RouteId));
            }
            return Result<GetAssigmentRouteDTO>.Success(detailRoute);
        }
    }
}
