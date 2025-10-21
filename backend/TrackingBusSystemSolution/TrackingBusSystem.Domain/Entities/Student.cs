using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class Student
    {

        public long Id { get; set; }


        public string Class { get; set; } = string.Empty;


        public string Address { get; set; } = string.Empty;

        public Gender Sex { get; set; }

        public string ParentName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string ParentPhoneNumber { get; set; } = string.Empty;

        public bool IsDeleted { get; set; } = false;


        // Foreign Keys
        public string UserId { get; set; } = string.Empty; // Changed to string
        public int PointId { get; set; }
        public int DriverId { get; set; }
        // Navigation properties

        public virtual AppUser User { get; set; } = null!;


        public virtual Driver Driver { get; set; } = null!;
        public virtual Point Point { get; set; } = null!;

        public virtual ICollection<TripStudentChecking> TripCheckings { get; set; } = new List<TripStudentChecking>();
    }

}
