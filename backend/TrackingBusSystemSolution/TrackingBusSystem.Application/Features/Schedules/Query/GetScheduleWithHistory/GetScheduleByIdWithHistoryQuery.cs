using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleWithHistory
{
    public record GetScheduleByIdWithHistoryQuery(int Id, TripDirection TripDirection) : IQuery<ScheduleWithHistoryDTO> { }


    public class GetScheduleByIdWithHistoryHandler : IQueryHandler<GetScheduleByIdWithHistoryQuery, ScheduleWithHistoryDTO>
    {

        private readonly IApplicationDbContext _context;
        public GetScheduleByIdWithHistoryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ScheduleWithHistoryDTO>> Handle(GetScheduleByIdWithHistoryQuery request, CancellationToken cancellationToken)
        {
            Console.WriteLine("=== GetScheduleByIdWithHistoryQuery ===");
            Console.WriteLine($"📥 Schedule ID: {request.Id}, TripDirection: {request.TripDirection}");
            
            var tripDirection = request.TripDirection == 0 ? TripDirection.Outbound : request.TripDirection;
            Console.WriteLine($"🔄 Using TripDirection: {tripDirection}");
            
            var schedule = await _context.Schedules
                .Include(s => s.Bus)
                .Include(s => s.Driver)
                    .ThenInclude(d => d.User)
                .Include(s => s.StudentCheckingHistories)
                    .ThenInclude(sh => sh.Student)
                        .ThenInclude(st => st.User)
                .Include(s => s.StudentCheckingHistories)
                    .ThenInclude(sh => sh.StopPoint)
                .IgnoreQueryFilters()
                .AsQueryable()
                .Where(s => s.Id == request.Id)
                .Select(s => new ScheduleWithHistoryDTO
                {
                    Id = s.Id,
                    BusName = s.Bus.BusName,
                    DriverName = s.Driver.User.LastName + " " + s.Driver.User.FirstName,
                    DropOffTime = s.DropOffTime,
                    PickupTime = s.PickupTime,
                    Status = s.Status,
                    StudentCheckingHistories = s.StudentCheckingHistories
                    .Where(sh => sh.Type == tripDirection)
                    .Select(sh => new StudentCheckingHistoryDTO
                    {
                        Status = sh.CheckingStatus.ToString(),
                        StopPointName = sh.StopPoint.PointName,
                        StudentId = sh.StudentId,
                        StudentName = sh.Student.User.LastName + " " + sh.Student.User.FirstName,
                        Type = sh.Type.ToString()

                    }).ToList()
                }).FirstOrDefaultAsync();

            if (schedule == null)
            {
                Console.WriteLine("❌ Schedule not found");
                return Result<ScheduleWithHistoryDTO>.Failure(ScheduleErrors.ScheduleNotFound);
            }
            
            Console.WriteLine($"✅ Found schedule with {schedule.StudentCheckingHistories.Count} history records for {tripDirection}");
            foreach (var history in schedule.StudentCheckingHistories)
            {
                Console.WriteLine($"  - Student {history.StudentId} ({history.StudentName}): {history.Status} at {history.StopPointName}");
            }
            
            return Result<ScheduleWithHistoryDTO>.Success(schedule);
        }
    }
}
