using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverDropdown
{
    public record GetAllDriverDropdownQuery(DateOnly? dateInWeek) : IQuery<List<GetAllDriverDropdownDTO>>
    {
    }
    public class GetAllDriverDropdownQueryHandler : IQueryHandler<GetAllDriverDropdownQuery, List<GetAllDriverDropdownDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllDriverDropdownQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<List<GetAllDriverDropdownDTO>>> Handle(GetAllDriverDropdownQuery request, CancellationToken cancellationToken)
        {
            bool hasDateFilter = false;
            if (request.dateInWeek != null)
            {
                hasDateFilter = true;
            }
            var allDriversWithStatus = await _dbContext.Drivers.AsNoTracking()
                .Select(driver => new GetAllDriverDropdownDTO
                {
                    Id = driver.Id,
                    DriverName = driver.User.LastName + " " + driver.User.FirstName,
                    CanClickable = hasDateFilter == true
                        ? !_dbContext.Schedules.Any(s => s.DriverId == driver.Id && s.ScheduleDate == request.dateInWeek!.Value)
                        : true
                }).ToListAsync();
            return Result<List<GetAllDriverDropdownDTO>>.Success(allDriversWithStatus);
        }

    }
}
