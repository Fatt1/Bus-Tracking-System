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
        public Task<bool> IsDriverAssignedToBusAsync(int busId)
        {
            // Truy vấn trực tiếp từ Driver, đúng trách nhiệm
            return appDbContext.Drivers.AnyAsync(d => d.BusId == busId);
        }

        public Task<List<int>> GetExistingIdsAsync(List<int> ids)
        {
            return appDbContext.Drivers.Where(d => ids.Contains(d.Id)).Select(d => d.Id).ToListAsync();
        }

        public async Task<List<Driver>> GetDriversWithBusByIdsAsync(IEnumerable<int> driverIds)
        {
            var idSet = driverIds.ToHashSet();
            return await appDbContext.Drivers
            .Include(d => d.Bus) // Quan trọng: Eager loading Bus
            .Where(d => idSet.Contains(d.Id)) // Lấy tất cả driver có ID trong danh sách
            .ToListAsync();
        }

        public Task<Driver?> GetDriverById(int driverId)
        {
            return appDbContext.Drivers.FirstOrDefaultAsync(d => d.Id == driverId);
        }
    }
}
