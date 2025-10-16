using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Domain.Entities
{

    public class Bus
    {

        public int Id { get; set; }


        public string BusName { get; set; } = string.Empty;


        public string PlateNumber { get; set; } = string.Empty;

        public bool Status { get; set; }

        // Navigation properties
        public virtual Driver Driver { get; set; } = default!;
        public virtual BusLastLocation? BusLastLocation { get; set; }
    }

    public static class BusErrors
    {
        public static Error BusNotFound(int Id) => new Error(
            Code: "Bus.NotFound",
            Message: $"The bus with id {Id} was not found."
        );
    }

}
