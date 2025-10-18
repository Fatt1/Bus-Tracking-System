using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IDriverRepository
    {
        Task<bool> AddDriver(Driver driver);
        Task<bool> IsDriverAssignedToBusAsync(int busId);
        Task<List<int>> GetExistingIdsAsync(List<int> ids);
    }
}
