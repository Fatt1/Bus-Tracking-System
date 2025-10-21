using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class BusRepository(AppDbContext context) : IBusRepository
    {

        public async Task<bool> AddBusAsync(Bus bus)
        {
            try
            {
                await context.Buses.AddAsync(bus);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> UpdateBusStatusById(int busId, bool status)
        {
            var bus = await context.Buses.FindAsync(busId);
            if (bus == null)
            {
                return false;
            }
            bus.Status = status;
            return true;
        }
    }
}
