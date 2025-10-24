using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleById
{
    public record GetScheduleByIdQuery(int Id) : IQuery<GetScheduleDTO>
    {
    }


    public class GetScheduleByIdQueryHandler : IQueryHandler<GetScheduleByIdQuery, GetScheduleDTO>
    {
        private readonly IApplicationDbContext _applicationDbContext;
        public GetScheduleByIdQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<Result<GetScheduleDTO>> Handle(GetScheduleByIdQuery request, CancellationToken cancellationToken)
        {
            var sheduleDTO = await _applicationDbContext.Schedules
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Where(s => s.Id == request.Id)
                .Select(s => new GetScheduleDTO
                {
                    Id = s.Id,
                    BusName = s.Bus.BusName,
                    DriverName = s.Driver.User.LastName + " " + s.Driver.User.FirstName,
                    DropOffTime = s.DropOffTime,
                    PickupTime = s.PickupTime,
                    Status = s.Status
                })
                .FirstOrDefaultAsync(cancellationToken);
            if (sheduleDTO == null)
            {
                return Result<GetScheduleDTO>.Failure(ScheduleErrors.ScheduleNotFound);
            }
            return Result<GetScheduleDTO>.Success(sheduleDTO);
        }
    }
}
