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
    }
}
