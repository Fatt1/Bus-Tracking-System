using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutes
{
    public record GetAllRoutesQuery : IQuery<List<GetRoutesResponse>>
    {
    }
    public class GetAllRoutesQueryHandler : IQueryHandler<GetAllRoutesQuery, List<GetRoutesResponse>>
    {
        private readonly IApplicationDbContext _dbContext;
        private readonly IMapper _mapper;
        public GetAllRoutesQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public async Task<Result<List<GetRoutesResponse>>> Handle(GetAllRoutesQuery request, CancellationToken cancellationToken)
        {
            var allRoutes = await _dbContext.Routes.Include(route => route.Points).ProjectTo<GetRoutesResponse>(_mapper.ConfigurationProvider).ToListAsync();
            return Result<List<GetRoutesResponse>>.Success(allRoutes);
        }
    }
}
