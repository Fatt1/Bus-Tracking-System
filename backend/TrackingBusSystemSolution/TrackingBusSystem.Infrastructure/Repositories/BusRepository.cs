using Microsoft.EntityFrameworkCore;
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


        public Task<bool> IsExist(int busId)
        {
            return context.Buses.AnyAsync(b => b.Id == busId);
        }

        public Task<Bus?> GetBusByIdAsync(int busId)
        {
            return context.Buses.FirstOrDefaultAsync(b => b.Id == busId);
        }
    }
}
