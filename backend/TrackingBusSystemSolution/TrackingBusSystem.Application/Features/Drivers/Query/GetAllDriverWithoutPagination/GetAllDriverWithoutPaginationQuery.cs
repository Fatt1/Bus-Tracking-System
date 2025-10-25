using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverWithoutPagination
{
    public record GetAllDriverWithoutPaginationQuery : IQuery<List<GetAllDriverWithoutPaginationDTO>>
    {
    }
    public class GetAllDriverWithoutPaginationQueryHandler : IQueryHandler<GetAllDriverWithoutPaginationQuery, List<GetAllDriverWithoutPaginationDTO>>
    {
        private IApplicationDbContext _applicationDbContext;
        public GetAllDriverWithoutPaginationQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<Result<List<GetAllDriverWithoutPaginationDTO>>> Handle(GetAllDriverWithoutPaginationQuery request, CancellationToken cancellationToken)
        {
            var drivers = await _applicationDbContext.Drivers.Select(d => new GetAllDriverWithoutPaginationDTO
            {
                FullName = d.User.LastName + " " + d.User.FirstName,
                Id = d.Id,
                UserId = d.UserId
            }).ToListAsync();
            return Result<List<GetAllDriverWithoutPaginationDTO>>.Success(drivers);
        }
    }
}
