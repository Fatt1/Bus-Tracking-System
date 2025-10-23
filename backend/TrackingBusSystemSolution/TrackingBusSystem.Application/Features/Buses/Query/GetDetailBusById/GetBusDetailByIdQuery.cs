using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Query.GetDetailBusById
{
    public record GetBusDetailByIdQuery(int Id) : IQuery<GetBusDetailDTO>
    {

    }
    public class GetBusDetailByIdQueryHandler : IQueryHandler<GetBusDetailByIdQuery, GetBusDetailDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        private readonly IMapper _mapper;
        public GetBusDetailByIdQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public async Task<Result<GetBusDetailDTO>> Handle(GetBusDetailByIdQuery request, CancellationToken cancellationToken)
        {


            DateOnly dateOnly = DateOnly.FromDateTime(DateTime.Now);
            var busDTO = await _dbContext.Buses

              .Where(b => b.Id == request.Id) // 1. Lọc xe buýt
              .Select(b => new GetBusDetailDTO // 2. Yêu cầu DB trả về DTO này
              {
                  // Các trường đơn giản
                  Id = b.Id,
                  BusName = b.BusName,
                  PlateNumber = b.PlateNumber,
                  Status = b.Status,

                  // Xạ ảnh lồng nhau (vẫn rất hiệu quả)
                  BusLastLocation = b.BusLastLocation == null ? null : new BusLastLocationDTO
                  {
                      Latitude = b.BusLastLocation.Latitude,
                      Longitude = b.BusLastLocation.Longitude
                  },

                  // 3. Lấy tên Driver (dùng sub-query trong .Select)
                  // EF Core sẽ tối ưu thành một LEFT JOIN hiệu quả
                  DriverName = b.Schedules
                      .Where(s => s.ScheduleDate == dateOnly)
                      .Select(s => s.Driver.User.FirstName + " " + s.Driver.User.LastName)
                      .FirstOrDefault(), // Lấy người đầu tiên (hoặc null nếu không có)

                  // 4. Lấy tên Route
                  RouteName = b.Schedules
                      .Where(s => s.ScheduleDate == dateOnly)
                      .Select(s => s.Route.RouteName)
                      .FirstOrDefault()
              })
              // Không cần AsNoTracking(), vì .Select() đã tự động không theo dõi
              .FirstOrDefaultAsync(cancellationToken);

            if (busDTO == null)
            {
                return Result<GetBusDetailDTO>.Failure(BusErrors.BusNotFound(request.Id));
            }

            return Result<GetBusDetailDTO>.Success(busDTO);
        }
    }

}
