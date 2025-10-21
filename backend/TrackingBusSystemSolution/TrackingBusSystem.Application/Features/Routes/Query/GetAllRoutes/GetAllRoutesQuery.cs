using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutes
{
    public record GetAllRoutesQuery : QueyStringParameters, IQuery<PagedList<GetRoutesResponse>>
    {
    }
    public class GetAllRoutesQueryHandler : IQueryHandler<GetAllRoutesQuery, PagedList<GetRoutesResponse>>
    {
        private readonly IApplicationDbContext _dbContext;

        public GetAllRoutesQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public Task<Result<PagedList<GetRoutesResponse>>> Handle(GetAllRoutesQuery request, CancellationToken cancellationToken)
        {

            var allRoutes = _dbContext.Routes
                .Select(r => new GetRoutesResponse
                {
                    Id = r.Id,
                    RouteName = r.RouteName,
                    DriverCounts = r.Buses.Count(b => b.Driver != null)
                });
            var pagedRoutes = PagedList<GetRoutesResponse>.ToPagedList(allRoutes, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetRoutesResponse>>.Success(pagedRoutes));
        }
    }
}
