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
            return context.Buses.Include(b => b.Schedules).FirstOrDefaultAsync(b => b.Id == busId);
        }

        public async Task<bool> IsBusFreeOnDate(int busId, DateOnly date, int? scheduleIdToIgnore)
        {
            var query = context.Schedules
               .Where(s => s.BusId == busId && s.ScheduleDate == date);
            if (scheduleIdToIgnore.HasValue)
            {
                query = query.Where(s => s.Id != scheduleIdToIgnore.Value);
            }
            return !(await query.AnyAsync());
        }

        public bool SoftDelete(Bus bus)
        {
            bus.IsDeleted = true;
            return true;
        }
    }
}
