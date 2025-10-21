namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public record GetStudentDTO
    {
        public long Id { get; set; }


        public string Class { get; set; } = string.Empty;


        public string Address { get; set; } = string.Empty;


        public string ParentName { get; set; } = string.Empty;


        public string ParentPhoneNumber { get; set; } = string.Empty;

        public int DriverId { get; set; }
        public string DriverName { get; set; } = string.Empty;
    }
}
