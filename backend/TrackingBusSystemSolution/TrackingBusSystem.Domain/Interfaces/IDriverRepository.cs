using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IDriverRepository
    {
        Task<bool> AddDriver(Driver driver);
        Task<bool> IsExist(int id);
        Task<Driver?> GetDriverById(int driverId);
        Task<List<int>> GetExistingIdsAsync(List<int> ids);
        Task<bool> SoftDelete(Driver driver);
    }
}
