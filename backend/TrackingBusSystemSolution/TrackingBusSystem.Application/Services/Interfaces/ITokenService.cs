using System.Security.Claims;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Application.Services.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateJwtTokenAsync(AppUser user, IEnumerable<Claim> customClaims = null);
    }
}
