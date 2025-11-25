using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TrackingBusSystem.Application.Abstractions.Common.DTOs;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Common.Helpers;
using TrackingBusSystem.Application.Features.Buses.Command;
using TrackingBusSystem.Application.Services.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Services
{
    public class BusTrackingService : IBusTrackingService
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<BusTrackingService> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        private const double PROXIMITY_THRESHOLD = 500;
        private const double RESET_THRESHOLD = 1000;

        public BusTrackingService(
            IServiceScopeFactory serviceScopeFactory,
            IMediator mediator,
            AppDbContext context,
            IMemoryCache cache,
            ILogger<BusTrackingService> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _mediator = mediator;
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        public async Task<BusLastLocationDTO?> ProcessLocationUpdateAsync(int busId, double lat, double lng, string tripType)
        {
            // 1. Lưu vị trí vào DB (dùng MediatR như cũ)
            await _mediator.Send(new BusLocationUpdateCommand { BusId = busId, Latitude = lat, Longitude = lng });

            // 2. Lấy thông tin Route từ Schedule
            var schedule = await _context.Schedules
                .Include(s => s.Route) // Include nhẹ để lấy tên Route
                .Where(s => s.BusId == busId && s.ScheduleDate == DateOnly.FromDateTime(DateTime.Today))
                .Select(s => new { s.RouteId, s.Route.RouteName })
                .FirstOrDefaultAsync();

            // 3. Xử lý logic thông báo cho phụ huynh (tách hàm private bên dưới)
            // Chạy bất đồng bộ không cần await để tránh block việc trả về location cho client (Fire-and-forget)
            _ = Task.Run(() => CheckAndNotifyParentsAsync(busId, lat, lng));

            // 4. Trả về dữ liệu để Hub gửi đi
            return new BusLastLocationDTO(lat, lng, busId, schedule?.RouteId, schedule?.RouteName, tripType);
        }

        private async Task CheckAndNotifyParentsAsync(int busId, double busLat, double busLng)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                // Logic cũ của bạn giữ nguyên, chỉ copy vào đây
                var schedule = await context.Schedules
                    .Include(s => s.Route).ThenInclude(r => r.StopPoints).ThenInclude(sp => sp.Students)
                    .Include(s => s.Driver)
                    .Where(s => s.BusId == busId && s.ScheduleDate == DateOnly.FromDateTime(DateTime.Today)) // Thêm đk ngày cho chính xác
                    .FirstOrDefaultAsync();

                if (schedule?.Route == null || schedule.Driver == null) return;

                var driverUserId = schedule.Driver.UserId;
                var stopPoints = schedule.Route.StopPoints.ToList();

                foreach (var stopPoint in stopPoints)
                {
                    var distance = GeoLocationHelper.CalculateDistance(busLat, busLng, stopPoint.Latitude, stopPoint.Longitude);
                    var cacheKey = $"NotificationSent_Bus{busId}_Stop{stopPoint.Id}";

                    if (distance <= PROXIMITY_THRESHOLD)
                    {
                        if (!_cache.TryGetValue(cacheKey, out bool _))
                        {
                            var students = stopPoint.Students.ToList();
                            if (students.Any())
                            {
                                var parentUserIds = students.Select(s => s.UserId).ToList();
                                var notification = new NotificationDto
                                {
                                    Title = "Xe buýt sắp đến!",
                                    Message = $"Xe buýt cách điểm '{stopPoint.PointName}' khoảng {Math.Round(distance)}m.",
                                    NotificationType = Shared.Constants.AnnouncementType.Info
                                };

                                await notificationService.SendNotificationToUsersAsync(parentUserIds, notification, driverUserId);
                                _cache.Set(cacheKey, true, TimeSpan.FromMinutes(30));
                                _logger.LogInformation($"Đã gửi thông báo Bus {busId} tới điểm {stopPoint.PointName}");
                            }
                        }
                    }
                    else if (distance > RESET_THRESHOLD)
                    {
                        _cache.Remove(cacheKey);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi gửi thông báo cho Bus {busId}");
            }
        }
    }
}
