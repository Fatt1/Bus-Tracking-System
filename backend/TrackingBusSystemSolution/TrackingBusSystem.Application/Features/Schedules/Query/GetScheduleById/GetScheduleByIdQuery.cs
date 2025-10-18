using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleById
{
    public record GetScheduleByIdQuery : IQuery<GetScheduleDTO>
    {
        public int Id { get; init; }
    }
    public class GetScheduleByIdQueryHandler : IQueryHandler<GetScheduleByIdQuery, GetScheduleDTO>
    {
        private readonly IApplicationDbContext _dbContext;

        public GetScheduleByIdQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        public async Task<Result<GetScheduleDTO>> Handle(GetScheduleByIdQuery request, CancellationToken cancellationToken)
        {
            var scheduleDTO = await _dbContext.Schedules
         .Where(s => s.Id == request.Id)
         .Select(s => new GetScheduleDTO // Chiếu thẳng vào DTO
         {
             Id = s.Id,
             ScheduleName = s.ScheduleName,
             ScheduleType = s.ScheduleType.ToString(),
             StartDate = s.StartDate,
             EndDate = s.EndDate,
             Status = s.Status.ToString(),
             DayOfWeeks = s.ScheduleWeeklies.Select(sw => sw.DayOfWeek).ToList(),
             ScheduleAssignments = s.ScheduleAssignments.Select(sa => new ScheduleAssignmentDTO
             {
                 Id = sa.Id,
                 RouteId = sa.RouteId,
                 DriverId = sa.DriverId,

                 // EF Core sẽ tự động dịch sa.Driver.User.FullName thành SQL JOIN
                 DriverName = sa.Driver.User.FullName,
                 RouteName = sa.Route.RouteName,

                 MorningDeparture = sa.MorningDeparture,
                 MorningArrival = sa.MorningArrival,
                 AfternoonDeparture = sa.AfternoonDeparture,
                 AfternoonArrival = sa.AfternoonArrival
             }).ToList()
         })
         .FirstOrDefaultAsync(cancellationToken); // Chỉ 1 query duy nhất

            if (scheduleDTO == null)
            {
                return Result<GetScheduleDTO>.Failure(ScheduleErrors.ScheduleNotFound);
            }

            return Result<GetScheduleDTO>.Success(scheduleDTO);
        }
    }
}

