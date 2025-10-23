using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetRouteByIdQuery
{
    public record GetRouteByIdQuery(int Id) : IQuery<GetRouteDTO>
    {
    }
    public class GetRouteByIdQueryHandler : IQueryHandler<GetRouteByIdQuery, GetRouteDTO>
    {
        private readonly IApplicationDbContext _applicationDbContext;
        public GetRouteByIdQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<Result<GetRouteDTO>> Handle(GetRouteByIdQuery request, CancellationToken cancellationToken)
        {
            var route = await _applicationDbContext.Routes.Where(r => r.Id == request.Id)
                .Select(r => new GetRouteDTO
                {
                    Id = r.Id,
                    RouteName = r.RouteName,
                    StopPoints = r.StopPoints.OrderBy(p => p.SequenceOrder).Select(p => new PointResponse
                    {
                        Id = p.Id,
                        PointName = p.PointName,
                        Latitude = p.Latitude,
                        Longitude = p.Longitude,
                        SequenceOrder = p.SequenceOrder

                    }).ToList()
                }).FirstOrDefaultAsync();
            if (route == null)
            {
                return Result<GetRouteDTO>.Failure(RouteErrors.RouteNotFound(request.Id));
            }
            return Result<GetRouteDTO>.Success(route);
        }
    }
}
