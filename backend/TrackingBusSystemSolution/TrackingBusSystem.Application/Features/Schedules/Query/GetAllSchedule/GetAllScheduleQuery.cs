using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Schedules.Query.GetAllSchedule
{
    public record GetAllScheduleQuery([Required] DateOnly DateInWeek) : IQuery<List<GetAllScheduleDTO>>
    {
    }
    public class GetAllScheduleQueryHandler : IQueryHandler<GetAllScheduleQuery, List<GetAllScheduleDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllScheduleQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetAllScheduleDTO>>> Handle(GetAllScheduleQuery request, CancellationToken cancellationToken)
        {
            DateOnly targetDate = request.DateInWeek; // Ngày nhận từ request
            DayOfWeek firstDayOfWeek = DayOfWeek.Monday; // Quy ước ngày đầu tuần là Thứ Hai

            // Bước 1: Chuyển DateOnly thành DateTime để dễ dàng tính toán DayOfWeek
            // (Vì DayOfWeek chỉ hoạt động với DateTime)
            DateTime targetDateTime = targetDate.ToDateTime(TimeOnly.MinValue);
            // Bước 2: Tính toán ngày đầu tuần (Thứ Hai)

            // - targetDate.DayOfWeek là giá trị từ 0 (Chủ Nhật) đến 6 (Thứ Bảy)
            // - DayOfWeek.Monday là 1
            int currentDayValue = (int)targetDateTime.DayOfWeek;
            int firstDayValue = (int)firstDayOfWeek;

            // Tính số ngày chênh lệch (diff)
            // Công thức: (7 + (current - start)) % 7
            // Ví dụ: Thứ Bảy (6) -> Thứ Hai (1). diff = (7 + (6 - 1)) % 7 = 5
            int diff = (7 + (currentDayValue - firstDayValue)) % 7;

            // Bước 3: Tính toán StartDate và EndDate
            DateOnly startDate = DateOnly.FromDateTime(targetDateTime.AddDays(-diff));
            DateOnly endDate = startDate.AddDays(6);
            var schedules = await _dbContext.Schedules.Where(s => s.ScheduleDate >= startDate && s.ScheduleDate <= endDate)
               .OrderBy(s => s.ScheduleDate)
              .Select(s => new GetAllScheduleDTO
              {
                  BusName = s.Bus.BusName,
                  DriverName = s.Driver.User.FirstName + " " + s.Driver.User.LastName,
                  DropOffTime = s.DropOffTime,
                  Id = s.Id,
                  PickupTime = s.PickupTime,
                  Status = s.Status,

              }).ToListAsync();

            return Result<List<GetAllScheduleDTO>>.Success(schedules);
        }
    }
}
