namespace TrackingBusSystem.Domain.Entities
{
    public class Student
    {

        public string Id { get; set; } = string.Empty;


        public string Class { get; set; } = string.Empty;


        public string Address { get; set; } = string.Empty;


        public string ParentName { get; set; } = string.Empty;


        public string ParentPhoneNumber { get; set; } = string.Empty;

        // Foreign Keys
        public string UserId { get; set; } = string.Empty; // Changed to string
        public int PointId { get; set; }

        // Navigation properties

        public virtual AppUser User { get; set; } = null!;


        public virtual Point Point { get; set; } = null!;

        public virtual ICollection<TripStudentChecking> TripCheckings { get; set; } = new List<TripStudentChecking>();
    }

}
