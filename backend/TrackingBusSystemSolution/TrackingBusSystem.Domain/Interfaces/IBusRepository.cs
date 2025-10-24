using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IBusRepository
    {
        Task<Bus?> GetBusByIdAsync(int busId);
        Task<bool> AddBusAsync(Bus bus);
        Task<bool> IsExist(int busId);
        Task<bool> IsBusFreeOnDate(int busId, DateOnly date, int? scheduleIdToIgnore);
        bool SoftDelete(Bus bus);
    }
}
