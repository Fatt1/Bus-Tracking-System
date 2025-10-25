using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Query.GetPickupList
{
    public record ScheduleQueryParams : QueyStringParameters
    {
        public DateOnly? Date { get; set; }
    }
    public record GetPickupScheduleDriverByIdQuery(int Id, DateOnly? Date, int PageNumber, int PageSize) : IQuery<PagedList<PickupScheduleDriverDTO>>
    {
    }

    public class GetPickupScheduleDriverByIdQueryHandler : IQueryHandler<GetPickupScheduleDriverByIdQuery, PagedList<PickupScheduleDriverDTO>>
    {
        private readonly IApplicationDbContext _applicationDbContext;

        public GetPickupScheduleDriverByIdQueryHandler(IApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<Result<PagedList<PickupScheduleDriverDTO>>> Handle(GetPickupScheduleDriverByIdQuery request, CancellationToken cancellationToken)
        {
            var date = request.Date ?? DateOnly.FromDateTime(DateTime.Now);
            var scheudle = await _applicationDbContext.Schedules.Include(s => s.Route).Where(s => s.ScheduleDate == date && s.DriverId == request.Id).FirstOrDefaultAsync();
            if (scheudle == null)
            {
                var emptyList = new PagedList<PickupScheduleDriverDTO>(
               new List<PickupScheduleDriverDTO>(), // Danh sách rỗng
               0,                                  // Tổng số bản ghi là 0
               request.PageNumber,
               request.PageSize);
                return Result<PagedList<PickupScheduleDriverDTO>>.Success(emptyList);

            }
            var query = _applicationDbContext.Students.Where(s => s.Point.RouteId == scheudle.Route.Id)
                .OrderBy(s => s.Point.SequenceOrder)
                .Select(s => new PickupScheduleDriverDTO
                {
                    ScheduleId = scheudle.Id,
                    Id = s.Id,
                    StudentName = s.User.LastName + " " + s.User.FirstName,
                    Class = s.Class,
                    StopPointId = s.Point.Id,
                    StopPointName = s.Point.PointName,
                    ParentName = s.ParentName,
                    ParentPhoneNumber = s.User.PhoneNumber!
                });
            var pageResult = PagedList<PickupScheduleDriverDTO>.ToPagedList(query, request.PageNumber, request.PageSize);
            return Result<PagedList<PickupScheduleDriverDTO>>.Success(pageResult);
        }
    }
}
