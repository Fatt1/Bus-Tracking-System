using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Query.GetAllBuses
{
    public record GetAllBusesQuery : QueyStringParameters, IQuery<PagedList<GetAllBusesDTO>>
    {
    }

    public class GetAllBusesQueryHandler : IQueryHandler<GetAllBusesQuery, PagedList<GetAllBusesDTO>>
    {
        private readonly IApplicationDbContext _dbContext;

        public GetAllBusesQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public Task<Result<PagedList<GetAllBusesDTO>>> Handle(GetAllBusesQuery request, CancellationToken cancellationToken)
        {
            DateOnly dateOnly = DateOnly.FromDateTime(DateTime.Now);
            var allBuses = _dbContext.Buses
             .Select(b => new GetAllBusesDTO
             {
                 Id = b.Id,
                 BusName = b.BusName,
                 PlateNumber = b.PlateNumber,
                 Status = b.Status,

                 // Lấy lịch trình hôm nay
                 DriverName = b!.Schedules
                                .Where(s => s.ScheduleDate == dateOnly)
                                .Select(s => s.Driver.User.LastName + " " + s.Driver.User.FirstName)
                                .FirstOrDefault(),

                 // Lấy tên tuyến đường
                 RouteName = b!.Schedules
                                .Where(s => s.ScheduleDate == dateOnly)
                                .Select(s => s.Route.RouteName)
                                .FirstOrDefault()
             })
             .AsQueryable();
            var pagedBuses = PagedList<GetAllBusesDTO>.ToPagedList(allBuses, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetAllBusesDTO>>.Success(pagedBuses));
        }
    }

}

