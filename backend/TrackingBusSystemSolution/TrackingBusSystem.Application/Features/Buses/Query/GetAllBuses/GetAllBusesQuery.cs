using AutoMapper;
using AutoMapper.QueryableExtensions;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Query.GetAllBuses
{
    public record GetAllBusesQuery : QueyStringParameters, IQuery<PagedList<GetAllBusesDTO>>
    {
    }

    public class GetAllBusesQueryHandler : IQueryHandler<GetAllBusesQuery, PagedList<GetAllBusesDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        private readonly IMapper _mapper;
        public GetAllBusesQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
        {
            _mapper = mapper;
            _dbContext = dbContext;
        }
        public Task<Result<PagedList<GetAllBusesDTO>>> Handle(GetAllBusesQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Buses.ProjectTo<GetAllBusesDTO>(_mapper.ConfigurationProvider);
            var pageResult = PagedList<GetAllBusesDTO>.ToPagedList(query, request.PageNumber, request.PageSize);

            return Task.FromResult(Result<PagedList<GetAllBusesDTO>>.Success(pageResult));
        }
    }
}
