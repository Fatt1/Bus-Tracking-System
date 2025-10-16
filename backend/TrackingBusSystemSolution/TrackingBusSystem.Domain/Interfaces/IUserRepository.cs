using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<AppUser?> AddUser(AppUser user, string password);
    }
}
