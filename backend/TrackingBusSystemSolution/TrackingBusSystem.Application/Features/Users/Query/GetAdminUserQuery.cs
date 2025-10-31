using Microsoft.AspNetCore.Identity;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Users.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Users.Query
{
    public record GetAdminUserQuery : IQuery<List<GetAdminUserDTO>>
    {
    }

    public class GetAdminUserQueryHandler : IQueryHandler<GetAdminUserQuery, List<GetAdminUserDTO>>
    {
        private readonly UserManager<AppUser> _userManager;
        public GetAdminUserQueryHandler(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Result<List<GetAdminUserDTO>>> Handle(GetAdminUserQuery request, CancellationToken cancellationToken)
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            var adminDTOs = admins.Select(admin => new GetAdminUserDTO
            {
                UserId = admin.Id,
                UserName = admin.UserName!
            }).ToList();
            return Result<List<GetAdminUserDTO>>.Success(adminDTOs);
        }
    }
}
