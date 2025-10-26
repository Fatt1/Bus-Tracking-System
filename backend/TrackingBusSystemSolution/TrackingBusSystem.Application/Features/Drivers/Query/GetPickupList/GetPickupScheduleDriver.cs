using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetPickupList
{

    public record GetPickupScheduleDriver(string userId) : IQuery<List<PickupScheduleDriverDTO>>
    {
    }

    public class GetPickupScheduleDriverByIdQueryHandler : IQueryHandler<GetPickupScheduleDriver, List<PickupScheduleDriverDTO>>
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public GetPickupScheduleDriverByIdQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<Result<List<PickupScheduleDriverDTO>>> Handle(GetPickupScheduleDriver request, CancellationToken cancellationToken)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
            var driver = await _applicationDbContext.Drivers
                .AsNoTracking()
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.User.Id == request.userId, cancellationToken);

            var driverSchedule = await _applicationDbContext.Schedules.AsNoTracking().Where(s => s.DriverId == driver!.Id && s.ScheduleDate == today).FirstOrDefaultAsync();
            if (driverSchedule == null)
            {
                return Result<List<PickupScheduleDriverDTO>>.Success(new List<PickupScheduleDriverDTO>());
            }
            var pickUpStudents = await _applicationDbContext.Students
                .Where(s => s.Point.RouteId == driverSchedule.RouteId)
                .AsNoTracking()
                .OrderBy(s => s.User.FirstName)
                .Select(s => new PickupScheduleDriverDTO
                {
                    StudentId = s.Id,
                    StudentName = s.User.LastName + " " + s.User.FirstName,
                    Class = s.Class,
                    ParentName = s.ParentName,
                    ParentPhoneNumber = s.User.PhoneNumber!,
                    ScheduleId = driverSchedule.Id,
                    StopPointId = s.PointId,
                    StopPointName = s.Point.PointName,
                    UserId = s.UserId

                }).ToListAsync(cancellationToken);

            return Result<List<PickupScheduleDriverDTO>>.Success(pickUpStudents);
        }
    }
}
