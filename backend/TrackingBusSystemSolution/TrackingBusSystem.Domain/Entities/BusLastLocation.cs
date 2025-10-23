namespace TrackingBusSystem.Domain.Entities
{
    public class BusLastLocation
    {

        public int BusId { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public byte[] LastUpdateTimestamp { get; set; } = null!;

        public virtual Bus Bus { get; set; } = null!;
    }

}
