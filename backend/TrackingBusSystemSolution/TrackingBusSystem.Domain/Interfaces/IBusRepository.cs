using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IBusRepository
    {
        Task<List<Bus>> GetBusesAsync();
        Task<Bus> GetBusAsync();
        Task<Bus> AddBusAsync(Bus bus);

    }
}
