using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Infrastructure.Data
{
    public static class DatabaseInitializer
    {
        /// <summary>
        /// Tự động chạy migration và seed data ban đầu
        /// </summary>
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;

            try
            {
                var context = services.GetRequiredService<AppDbContext>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>();
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                var logger = services.GetRequiredService<ILogger<AppDbContext>>();

                // 1. Tự động chạy các migration chưa được apply
                logger.LogInformation("Đang kiểm tra và chạy migrations...");
                if ((await context.Database.GetPendingMigrationsAsync()).Count() != 0)
                {
                    await context.Database.MigrateAsync();
                    logger.LogInformation("✅ Migrations đã được apply thành công!");

                }

                // 3. Seed admin user mặc định
                await SeedAdminUserAsync(userManager, logger);

                logger.LogInformation("✅ Database đã được khởi tạo thành công!");
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<AppDbContext>>();
                logger.LogError(ex, "❌ Lỗi khi khởi tạo database");
                throw;
            }
        }


        /// <summary>
        /// Tạo admin user mặc định nếu chưa tồn tại
        /// </summary>
        private static async Task SeedAdminUserAsync(UserManager<AppUser> userManager, ILogger logger)
        {
            logger.LogInformation("Đang kiểm tra và tạo admin user...");

            const string adminUsername = "admin123";
            const string adminPassword = "admin123";

            var adminUser = await userManager.FindByNameAsync(adminUsername);

            if (adminUser == null)
            {
                adminUser = new AppUser
                {
                    UserName = adminUsername,
                    PhoneNumber = "0123456789",
                    FirstName = "Admin",
                    LastName = "System",
                    Sex = Gender.Male,
                    DateOfBirth = new DateOnly(1990, 1, 1),
                    IsActive = true,
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, adminPassword);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, Roles.Admin.ToString());
                    logger.LogInformation("✅ Đã tạo admin user mặc định");
                    logger.LogInformation($"   Username: {adminUsername}");
                    logger.LogInformation($"   Password: {adminPassword}");
                    logger.LogWarning("⚠️ QUAN TRỌNG: Vui lòng đổi mật khẩu admin sau khi đăng nhập lần đầu!");
                }
                else
                {
                    logger.LogError($"❌ Không thể tạo admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                logger.LogInformation($"ℹ️ Admin user '{adminUsername}' đã tồn tại");
            }
        }
    }
}