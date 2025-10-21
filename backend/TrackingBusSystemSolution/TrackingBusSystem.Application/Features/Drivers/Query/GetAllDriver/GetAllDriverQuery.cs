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
            var allDrivers = _dbContext.Drivers.Select(driver => new GetAllDriverDTO
            {
                Id = driver.Id,
                BusId = driver.BusId,
                FullName = driver.User.FullName,
                BusName = driver.Bus.BusName,
                PhoneNumber = driver!.User!.UserName,
            });
            var pageResult = PagedList<GetAllDriverDTO>.ToPagedList(allDrivers, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetAllDriverDTO>>.Success(pageResult));
        }
    }
}
