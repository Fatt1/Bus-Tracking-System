using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Authentication.DTOs;
using TrackingBusSystem.Application.Services.Interfaces;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

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

        public LoginCommandHandler(UserManager<AppUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;

        }
        public async Task<Result<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);

            if (user == null || await _userManager.CheckPasswordAsync(user, request.Password) == false)
            {
                return Result<LoginResponseDto>.Failure(new Error("Login.ErrorLogin", "Invalid user or password"));
            }
            if (user.IsActive == false)
            {
                return Result<LoginResponseDto>.Failure(new Error("Login.ErrorLogin", "User is deactivated"));
            }
            var userRoles = await _userManager.GetRolesAsync(user);
            var customClaims = new List<Claim>();



            var tokenString = await _tokenService.GenerateJwtTokenAsync(user, customClaims);
            var loginDto = new LoginResponseDto { Token = tokenString, UserName = user.UserName!, FullName = user.LastName + " " + user.FirstName };
            return Result<LoginResponseDto>.Success(loginDto);
        }


    }
}
