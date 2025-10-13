namespace TrackingBusSystem.Domain.Entities
{
    public class Bus
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public bool IsActive { get; set; }
        public string NumberPlate { get; set; } = default!;

    }
}
