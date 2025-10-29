using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutesNoPagination
{
    public record GetAllRouteNoPaginationQuery : IQuery<List<GetRoutesResponse>>
    {
    }

    public class GetAllRouteNoPaginationQueryHandler : IQueryHandler<GetAllRouteNoPaginationQuery, List<GetRoutesResponse>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllRouteNoPaginationQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<Result<List<GetRoutesResponse>>> Handle(GetAllRouteNoPaginationQuery request, CancellationToken cancellationToken)
        {
            var routes = await _context.Routes.Select(r => new GetRoutesResponse
            {
                Id = r.Id,
                RouteName = r.RouteName,
                StopPoints = r.StopPoints.Select(sp => new PointResponse
                {
                    Id = sp.Id,
                    PointName = sp.PointName,
                    Latitude = sp.Latitude,
                    Longitude = sp.Longitude,
                    SequenceOrder = sp.SequenceOrder
                }).OrderBy(sp => sp.SequenceOrder).ToList(),
                StudentCounts = 0

            }).ToListAsync();
            return Result<List<GetRoutesResponse>>.Success(routes);
        }
    }

}
