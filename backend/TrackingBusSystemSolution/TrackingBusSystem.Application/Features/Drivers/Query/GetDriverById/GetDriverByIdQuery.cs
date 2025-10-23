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
                FirstName = dr.User.FirstName,
                DateOfBirth = dr.User.DateOfBirth,
                LastName = dr.User.LastName,
                Address = dr.Address,
                Id = dr.Id,
                IDCard = dr.Idcard,
                Password = "",
                PhoneNumber = dr.User.PhoneNumber!,
                Sex = dr.User.Sex,
                UserName = dr.User.UserName!
            }).FirstOrDefaultAsync(dr => dr.Id == request.Id);
            if (driver == null)
            {
                return Result<GetDriverDTO>.Failure(DriverErrors.DriverNotFound(request.Id));
            }
            return Result<GetDriverDTO>.Success(driver);

        }
    }
}
