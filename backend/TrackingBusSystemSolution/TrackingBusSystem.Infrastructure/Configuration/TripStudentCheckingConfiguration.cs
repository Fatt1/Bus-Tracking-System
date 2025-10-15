using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class TripStudentCheckingConfiguration : IEntityTypeConfiguration<TripStudentChecking>
    {
        public void Configure(EntityTypeBuilder<TripStudentChecking> builder)
        {
            builder.HasKey(c => c.Id);

            // Tạo khóa  (composite key) để đảm bảo một học sinh chỉ được check-in
            // một lần duy nhất cho một chuyến đi.
            builder.HasIndex(c => new { c.GeneratedTripId, c.StudentId }).IsUnique();

            builder.HasOne(c => c.Student)
                   .WithMany(s => s.TripCheckings)
                   .HasForeignKey(c => c.StudentId)
                   .OnDelete(DeleteBehavior.Restrict); // Không cho xóa học sinh nếu có lịch sử điểm danh
        }
    }
}
