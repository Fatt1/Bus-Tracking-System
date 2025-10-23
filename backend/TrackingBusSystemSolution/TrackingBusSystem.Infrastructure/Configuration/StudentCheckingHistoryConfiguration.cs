using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class StudentCheckingHistoryConfiguration : IEntityTypeConfiguration<StudentCheckingHistory>
    {
        public void Configure(EntityTypeBuilder<StudentCheckingHistory> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__StudentC__3214EC0723F89E3C");
            builder.ToTable("StudentCheckingHistory");
            builder.HasIndex(e => e.Id, "UQ__StudentC__3214EC064ECDF52E").IsUnique();

            builder.HasOne(d => d.Schedule)
                .WithMany(p => p.StudentCheckingHistories)
                .HasForeignKey(d => d.ScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StudentCheckingHistory_fk1");

            builder.HasOne(d => d.StopPoint)
                .WithMany(p => p.StudentCheckingHistories)
                .HasForeignKey(d => d.StopPointId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StudentCheckingHistory_fk5");

            builder.HasOne(d => d.Student)
                .WithMany(p => p.StudentCheckingHistories)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StudentCheckingHistory_fk2");
        }
    }
}
