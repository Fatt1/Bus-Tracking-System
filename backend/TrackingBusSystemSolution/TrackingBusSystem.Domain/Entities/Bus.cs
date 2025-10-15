namespace TrackingBusSystem.Domain.Entities
{

    public class Bus
    {

        public int Id { get; set; }


        public string BusName { get; set; } = string.Empty;


        public string PlateNumber { get; set; } = string.Empty;

        public bool Status { get; set; }

        // Navigation properties
        public virtual ICollection<Driver> Drivers { get; set; } = new List<Driver>();
        public virtual BusLastLocation? BusLastLocation { get; set; }
    }


}
