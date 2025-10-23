using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriver
{
    public record GetAllDriverQuery : QueyStringParameters, IQuery<PagedList<GetAllDriverDTO>>
    {
    }
    public class GetAllDriverQueryHandler : IQueryHandler<GetAllDriverQuery, PagedList<GetAllDriverDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllDriverQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public Task<Result<PagedList<GetAllDriverDTO>>> Handle(GetAllDriverQuery request, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            var allDrivers = _dbContext.Drivers.AsNoTracking().Select(driver => new GetAllDriverDTO
            {
                Id = driver.Id,
                PhoneNumber = driver.User.PhoneNumber!,
                FullName = driver.User.FirstName + " " + driver.User.LastName,
                Status = driver.Status,
                AssignmentRouteName = driver.Schedules.Where(s => s.ScheduleDate == today)
                  .Select(s => s.Route.RouteName)
                  .FirstOrDefault()

            });
            var pageResult = PagedList<GetAllDriverDTO>.ToPagedList(allDrivers, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetAllDriverDTO>>.Success(pageResult));
        }
    }
}
