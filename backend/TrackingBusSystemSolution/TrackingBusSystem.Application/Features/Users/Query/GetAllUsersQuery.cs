using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Users.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Users.Query
{
    public record GetAllUsersQuery : IQuery<List<GetAllUSersDTO>>
    {
    }
    public class GetAllUsersQueryHandler : IQueryHandler<GetAllUsersQuery, List<GetAllUSersDTO>>
    {
        private readonly UserManager<AppUser> _userManager;
        public GetAllUsersQueryHandler(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }
        public async Task<Result<List<GetAllUSersDTO>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            // Đang bị N +1 query problem
            var users = await _userManager.Users.ToListAsync();
            var usersDto = new List<GetAllUSersDTO>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                usersDto.Add(new GetAllUSersDTO
                {
                    UserId = user.Id,
                    FullName = user.LastName + " " + user.FirstName,
                    DateOfBirth = user.DateOfBirth,
                    Roles = roles.ToList()
                });
            }
            return Result<List<GetAllUSersDTO>>.Success(usersDto);
        }
    }
}
