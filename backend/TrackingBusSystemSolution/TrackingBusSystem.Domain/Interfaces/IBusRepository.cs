using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IBusRepository
    {
        Task<bool> UpdateBusStatusById(int busId, bool status);
        Task<bool> AddBusAsync(Bus bus);
        Task<bool> IsExistingBus(int busId);
    }
}
