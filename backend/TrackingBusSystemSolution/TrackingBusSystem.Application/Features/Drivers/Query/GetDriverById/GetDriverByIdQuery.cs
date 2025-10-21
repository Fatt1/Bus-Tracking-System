using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetDriverById
{
    public record GetDriverByIdQuery(int Id) : IQuery<GetDriverDTO>
    {

    }
    public class GetDriverByIdQueryHandler(IApplicationDbContext dbContext) : IQueryHandler<GetDriverByIdQuery, GetDriverDTO>
    {

        public async Task<Result<GetDriverDTO>> Handle(GetDriverByIdQuery request, CancellationToken cancellationToken)
        {
            var driver = await dbContext.Drivers.Select(dr => new GetDriverDTO
            {
                BusId = dr.BusId,
                DateOfBirth = dr.DateOfBirth,
                FullName = dr.User.FullName,
                IDCard = dr.IDCard,
                Address = dr.Address,
                BusName = dr.Bus.BusName,
                Id = dr.Id,
                PhoneNumber = dr.PhoneNumber,
                RouteId = dr.Bus.RouteId,
                RouteName = dr.Bus.Route.RouteName,
                Sex = dr.Sex

            }).FirstOrDefaultAsync(dr => dr.Id == request.Id);
            if (driver == null)
            {
                return Result<GetDriverDTO>.Failure(DriverErrors.DriverNotFound(request.Id));
            }
            return Result<GetDriverDTO>.Success(driver);

        }
    }
}
