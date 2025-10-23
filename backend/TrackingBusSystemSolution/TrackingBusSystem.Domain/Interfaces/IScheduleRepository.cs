using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IScheduleRepository
    {
        Task<Schedule?> GetByIdAsync(int id, CancellationToken cancellationToken);
        Task<bool> AddSchedule(Schedule schedule);
        bool DeleteSchedule(Schedule schedule);
        bool UpdateSchedule(Schedule schedule);
    }
}
