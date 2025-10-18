using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IScheduleRepository
    {
        Task<bool> AddSchedule(Schedule schedule);
    }
}
