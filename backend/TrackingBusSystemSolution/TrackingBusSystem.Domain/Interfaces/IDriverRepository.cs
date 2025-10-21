using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IDriverRepository
    {
        Task<bool> AddDriver(Driver driver);
        Task<Driver?> GetDriverById(int driverId);
        Task<bool> IsDriverAssignedToBusAsync(int busId);
        Task<List<int>> GetExistingIdsAsync(List<int> ids);
        Task<List<Driver>> GetDriversWithBusByIdsAsync(IEnumerable<int> driverIds);
    }
}
