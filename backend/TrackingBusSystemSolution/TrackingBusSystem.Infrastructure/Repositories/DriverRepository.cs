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
            return appDbContext.Drivers.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == driverId);
        }

        public Task<bool> IsExist(int id)
        {
            return appDbContext.Drivers.AnyAsync(d => d.Id == id);
        }

        public Task<bool> SoftDelete(Driver driver)
        {
            throw new NotImplementedException();
        }
    }
}
