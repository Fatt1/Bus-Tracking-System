using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class StudentConfiguration : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__Student__3214EC07A694E5CB");
            builder.ToTable("Student"); // Tên bảng
            builder.HasIndex(e => e.Id, "UQ__Student__3214EC06EA2BF211").IsUnique();

            // **THÊM DÒNG NÀY ĐỂ ID TỰ ĐỘNG TĂNG (IDENTITY)**
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.HasIndex(e => e.UserId).IsUnique();

            builder.HasOne(d => d.Point) // Giả định có Entity Point
                .WithMany(p => p.Students)
                .HasForeignKey(d => d.PointId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Student_fk6");

            builder.Property(s => s.Class).HasMaxLength(50);
            builder.Property(s => s.Address).HasMaxLength(255);
            builder.Property(s => s.ParentName).HasMaxLength(100);

        }
    }
}
