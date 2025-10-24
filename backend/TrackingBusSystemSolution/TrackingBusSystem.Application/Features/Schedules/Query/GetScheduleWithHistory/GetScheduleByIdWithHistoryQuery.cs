using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleWithHistory
{
    public class GetScheduleByIdWithHistoryQuery(int Id) : IQuery<ScheduleWithHistoryDTO>
    {
    }

    public class GetScheduleByIdWithHistoryHandler : IQueryHandler<GetScheduleByIdWithHistoryQuery, ScheduleWithHistoryDTO>
    {
        private readonly IApplicationDbContext _context;
        public GetScheduleByIdWithHistoryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ScheduleWithHistoryDTO>> Handle(GetScheduleByIdWithHistoryQuery request, CancellationToken cancellationToken)
        {
            var schedule = await _context.Schedules
                .IgnoreQueryFilters()
                .AsQueryable()
                .Select(s => new ScheduleWithHistoryDTO
                {
                    Id = s.Id,
                    BusName = s.Bus.BusName,
                    DriverName = s.Driver.User.LastName + " " + s.Driver.User.FirstName,
                    DropOffTime = s.DropOffTime,
                    PickupTime = s.PickupTime,
                    Status = s.Status,
                    StudentCheckingHistories = s.StudentCheckingHistories
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
                return Result<ScheduleWithHistoryDTO>.Failure(ScheduleErrors.ScheduleNotFound);
            }
            return Result<ScheduleWithHistoryDTO>.Success(schedule);
        }
    }
}
