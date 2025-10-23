using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{

    public class Bus
    {

        public int Id { get; set; }

        public string BusName { get; set; } = null!;

        public string PlateNumber { get; set; } = null!;

        public BusStatus Status { get; set; }

        public virtual BusLastLocation? BusLastLocation { get; set; }

        public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    }

    public static class BusErrors
    {
        public static Error BusNotFound(int Id) => new Error(
            Code: "Bus.NotFound",
            Message: $"The bus with id {Id} was not found."
        );
    }

}
