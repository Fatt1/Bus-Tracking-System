using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Domain.Entities
{
    public class Student
    {

        public int Id { get; set; }

        public string Class { get; set; } = null!;

        public string Address { get; set; } = null!;

        public string ParentName { get; set; } = null!;

        public string UserId { get; set; } = null!;

        public int PointId { get; set; }

        public bool IsDeleted { get; set; } = false;


        public virtual AppUser User { get; set; } = null!;
        public virtual StopPoint Point { get; set; } = null!;

        public virtual ICollection<StudentCheckingHistory> StudentCheckingHistories { get; set; } = new List<StudentCheckingHistory>();
    }

    public static class StudentErrors
    {
        public static Error StudentNotFound(int id) => new Error("Student.NotFound", $"The student with id {id} was not found.");
    }

}
