using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class Driver
    {

        public int Id { get; set; }

        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string IDCard { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public Gender Sex { get; set; }

        // Foreign Keys
        public int BusId { get; set; }
        public string UserId { get; set; } = string.Empty; // Changed to string

        // Navigation properties

        public virtual Bus Bus { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;

        public virtual ICollection<GeneratedTrip> GeneratedTrips { get; set; } = new List<GeneratedTrip>();
        public virtual ICollection<ScheduleAssignment> ScheduleAssignments { get; set; } = new List<ScheduleAssignment>();
    }

    public static class DriverErrors
    {
        public static Error BusAlreadyHasDriver => new Error("Bus.BusAlreadyHasDriver", "The bus has already driver");
    }
}
