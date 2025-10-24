using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class DriverRepository(AppDbContext appDbContext) : IDriverRepository
    {

        public async Task<bool> AddDriver(Driver driver)
        {
            try
            {
                await appDbContext.Drivers.AddAsync(driver);
                return true;
            }
            catch (Exception ex)
            {
                // Log the exception (you can use a logging framework here)
                Console.WriteLine($"Error adding driver: {ex.Message}");
                return false;
            }
        }


        public Task<List<int>> GetExistingIdsAsync(List<int> ids)
        {
            return appDbContext.Drivers.Where(d => ids.Contains(d.Id)).Select(d => d.Id).ToListAsync();
        }


        public Task<Driver?> GetDriverById(int driverId)
        {
            return appDbContext.Drivers.Include(d => d.User).Include(dr => dr.Schedules).FirstOrDefaultAsync(d => d.Id == driverId);
        }

        public Task<bool> IsExist(int id)
        {
            return appDbContext.Drivers.AnyAsync(d => d.Id == id);
        }

        public bool SoftDelete(Driver driver)
        {
            driver.IsDeleted = true;
            return true;
        }

        public async Task<bool> IsDriverFreeOnDate(int driverId, DateOnly date, int? scheduleIdToIgnore)
        {
            var query = appDbContext.Schedules
                .Where(s => s.DriverId == driverId && s.ScheduleDate == date);
            if (scheduleIdToIgnore.HasValue)
            {
                query = query.Where(s => s.Id != scheduleIdToIgnore.Value);
            }
            return !(await query.AnyAsync());
        }
    }
}
