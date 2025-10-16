using Microsoft.AspNetCore.Identity;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<AppUser> _userManager;
        public UserRepository(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<AppUser?> AddUser(AppUser user, string password)
        {
            //var result = await _userManager.CreateAsync(user, password);
            //if (result.Succeeded)
            //{
            //    return user;
            //}
            //else
            //{
            //    // Nếu thất bại, ném ra một exception với danh sách lỗi
            //    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            //    throw new InvalidOperationException($"Không thể tạo người dùng: {errors}");
            //}
            throw new NotImplementedException();
        }
    }
}
