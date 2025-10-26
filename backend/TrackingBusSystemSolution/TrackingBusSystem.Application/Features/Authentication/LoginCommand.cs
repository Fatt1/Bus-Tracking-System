using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Authentication.DTOs;
using TrackingBusSystem.Application.Services.Interfaces;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Authentication
{
    public record LoginCommand : ICommand<LoginResponseDto>
    {
        [Required]
        public string UserName { get; init; } = string.Empty;
        [Required]
        public string Password { get; init; } = string.Empty;
    }

    public class LoginCommandHandler : ICommandHandler<LoginCommand, LoginResponseDto>
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IApplicationDbContext _applicationContext;
        public LoginCommandHandler(UserManager<AppUser> userManager, ITokenService tokenService, IApplicationDbContext applicationContext)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _applicationContext = applicationContext;
        }
        public async Task<Result<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null || await _userManager.CheckPasswordAsync(user, request.Password) == false)
            {
                return Result<LoginResponseDto>.Failure(new Error("Login.ErrorLogin", "Invalid user or password"));
            }
            var userRoles = await _userManager.GetRolesAsync(user);
            var customClaims = new List<Claim>();
            int? busIdForToday = null;

            if (userRoles.Contains(Roles.Driver.ToString()))
            {

                var driver = await _applicationContext.Drivers
                    .AsNoTracking() // Tối ưu hóa vì chỉ đọc
                    .FirstOrDefaultAsync(d => d.User.Id == user.Id, cancellationToken);
                if (driver != null)
                {
                    customClaims.Add(new Claim("UserId", driver.Id.ToString()));
                    busIdForToday = await GetBusIdForDriverAsync(driver.Id, cancellationToken);
                }
            }

            if (userRoles.Contains(Roles.Parent.ToString()))
            {
                var student = await _applicationContext.Students
                    .Include(s => s.Point)
                    .AsTracking()
                    .FirstOrDefaultAsync(s => s.UserId == user.Id, cancellationToken);
                if (student != null)
                {
                    customClaims.Add(new Claim("UserId", student.Id.ToString()));
                    busIdForToday = await GetBusForParentAsync(student, cancellationToken);
                }

            }
            var tokenString = await _tokenService.GenerateJwtTokenAsync(user, customClaims);
            var loginDto = new LoginResponseDto { BusIdForToday = busIdForToday, Token = tokenString, UserName = user.UserName! };
            return Result<LoginResponseDto>.Success(loginDto);
        }

        // Hàm private tìm BusId BẰNG DRIVER.ID (int)
        private async Task<int?> GetBusIdForDriverAsync(int driverId, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            var schedule = await _applicationContext.Schedules // Giả sử tên DbSet là Schedules
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.DriverId == driverId && s.ScheduleDate == today, cancellationToken);

            return schedule?.BusId;
        }

        private async Task<int?> GetBusForParentAsync(Student student, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            var schedule = await _applicationContext.Schedules.FirstOrDefaultAsync(s => s.RouteId == student.Point.RouteId && s.ScheduleDate == today);
            return schedule?.BusId;
        }
    }
}
