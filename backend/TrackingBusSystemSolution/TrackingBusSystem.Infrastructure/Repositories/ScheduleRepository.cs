using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class ScheduleRepository(AppDbContext dbContext) : IScheduleRepository
    {

        public async Task<bool> AddSchedule(Schedule schedule)
        {
            try
            {
                await dbContext.Schedules.AddAsync(schedule);
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }
    }
}
