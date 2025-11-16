using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Users.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Users.Query
{
    public record GetProfileQuery(string UserId) : IQuery<GetProfileDTO>
    {
    }

    public class GetProfileQueryHandler : IQueryHandler<GetProfileQuery, GetProfileDTO>
    {
        private readonly IApplicationDbContext _context;

        public GetProfileQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<Result<GetProfileDTO>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _context.AppUsers
                .Include(a => a.Student)
                .Include(u => u.Driver)
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<GetProfileDTO>.Failure(new Error("User.NotFound", "User not found."));
            }
            var address = "admin address";
            if (user.Student != null)
            {
                address = user.Student.Address;
            }
            else if (user.Driver != null)
            {
                address = user.Driver.Address;
            }
            var dto = new GetProfileDTO
            {
                UserId = user.Id,
                UserName = user.UserName!,
                FullName = $"{user.FirstName} {user.LastName}",
                PhoneNumber = user.PhoneNumber!,
                Address = address,
                Sex = user.Sex,
                DateOfBith = user.DateOfBirth,
            };

            return Result<GetProfileDTO>.Success(dto);
        }
    }
}


