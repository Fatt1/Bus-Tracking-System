using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IDriverRepository
    {
        Task<bool> AddDriver(Driver driver);
    }
}
