using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Query.GetAllBusSimple
{
    public record GetAllBusSimpleQuery : IQuery<List<GetAllBusSimpleDTO>>
    {
    }
    public class GetAllBusSimpleQueryHandler : IQueryHandler<GetAllBusSimpleQuery, List<GetAllBusSimpleDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllBusSimpleQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetAllBusSimpleDTO>>> Handle(GetAllBusSimpleQuery request, CancellationToken cancellationToken)
        {
            var buses = await _dbContext.Buses.Select(b => new GetAllBusSimpleDTO
            {
                Id = b.Id,
                Status = b.Status,
                BusName = b.BusName,

            }).ToListAsync();
            return Result<List<GetAllBusSimpleDTO>>.Success(buses);
        }
    }
}
