using Microsoft.EntityFrameworkCore;
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



        public bool DeleteSchedule(Schedule schedule)
        {
            try
            {
                dbContext.Remove(schedule);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public Task<Schedule?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            var schedule = dbContext.Schedules.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
            return schedule;
        }

        public bool UpdateSchedule(Schedule schedule)
        {
            try
            {
                dbContext.Schedules.Update(schedule);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
