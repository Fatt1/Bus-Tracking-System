using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverSimple
{
    public record GetAllDriverSimpleQuery : IQuery<List<DriverSimpleDTO>>
    {
    }
    public class GetAllDriverSimpleQueryHandler : IQueryHandler<GetAllDriverSimpleQuery, List<DriverSimpleDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllDriverSimpleQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<DriverSimpleDTO>>> Handle(GetAllDriverSimpleQuery request, CancellationToken cancellationToken)
        {
            var driverDTO = await _dbContext.Drivers.Select(d => new DriverSimpleDTO
            {
                Id = d.Id,
                FullName = d.User.FullName,
                BusId = d.BusId,
                BusName = d.Bus.BusName

            }).ToListAsync();

            return Result<List<DriverSimpleDTO>>.Success(driverDTO);
        }
    }
}
