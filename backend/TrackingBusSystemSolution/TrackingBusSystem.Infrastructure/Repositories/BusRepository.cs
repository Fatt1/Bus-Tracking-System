using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class BusRepository(AppDbContext context) : IBusRepository
    {
        public Task<Bus> AddBusAsync(Bus bus)
        {
            throw new NotImplementedException();
        }


    }
}
