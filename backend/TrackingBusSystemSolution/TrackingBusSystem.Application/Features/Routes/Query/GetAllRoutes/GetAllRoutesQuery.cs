using AutoMapper;
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
        private readonly IMapper _mapper;
        public GetAllRoutesQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public Task<Result<PagedList<GetRoutesResponse>>> Handle(GetAllRoutesQuery request, CancellationToken cancellationToken)
        {
            DateTime today = DateTime.Today;
            var allRoutes = _dbContext.Routes
                .Select(r => new GetRoutesResponse
                {
                    Id = r.Id,
                    RouteName = r.RouteName,
                    ScheduleAssignmentCount = r.ScheduleAssignments.Count(sa => sa.Schedule.StartDate.Date <= today && today <= sa.Schedule.EndDate.Date),
                });
            var pagedRoutes = PagedList<GetRoutesResponse>.ToPagedList(allRoutes, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetRoutesResponse>>.Success(pagedRoutes));
        }
    }
}
