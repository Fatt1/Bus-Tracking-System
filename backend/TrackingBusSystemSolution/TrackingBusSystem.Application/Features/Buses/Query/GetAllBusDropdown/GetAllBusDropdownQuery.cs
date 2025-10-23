using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Query.GetAllBusDropdown
{
    public record GetAllBusDropdownQuery(DateOnly? dateInWeek) : IQuery<List<GetAllBusDropdownDTO>>
    {
    }
    public class GetAllBusDropdownQueryHandler : IQueryHandler<GetAllBusDropdownQuery, List<GetAllBusDropdownDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllBusDropdownQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetAllBusDropdownDTO>>> Handle(GetAllBusDropdownQuery request, CancellationToken cancellationToken)
        {
            bool hasDateFilter = false;
            if (request.dateInWeek != null)
            {
                hasDateFilter = true;
            }
            var allBusesWithStatus = await _dbContext.Buses.AsNoTracking()
                .Select(bus => new GetAllBusDropdownDTO
                {
                    Id = bus.Id,
                    BusName = bus.BusName,
                    CanClickable = hasDateFilter == true
                        ? !_dbContext.Schedules.Any(s => s.BusId == bus.Id && s.ScheduleDate == request.dateInWeek!.Value)
                        : true
                }).ToListAsync();
            return Result<List<GetAllBusDropdownDTO>>.Success(allBusesWithStatus);

        }
    }
}
