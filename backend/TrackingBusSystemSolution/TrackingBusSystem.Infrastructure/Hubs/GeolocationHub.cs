using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TrackingBusSystem.Application.Services.Interfaces;

namespace TrackingBusSystem.Infrastructure.Hubs
{
    [Authorize]
    public class GeolocationHub : Hub
    {
        private readonly IBusTrackingService _busTrackingService;

        public GeolocationHub(
          IBusTrackingService busTrackingService)
        {
            _busTrackingService = busTrackingService;
        }

        public async Task JoinBusGroup(int busId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Bus-{busId}");
        }

        // Client (admin) gọi để tham gia nhóm
        public async Task JoinAdminGroup()
        {
            // TODO: Thêm logic xác thực
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin-group");
        }

        public async Task SendLocation(int busId, double lat, double lng, string tripType)
        {
            // Gọi service để xử lý logic
            var resultDto = await _busTrackingService.ProcessLocationUpdateAsync(busId, lat, lng);

            // Nếu có dữ liệu trả về thì gửi broadcast
            if (resultDto != null)
            {
                // 1. Gửi cho những người đang xem bus này
                await Clients.Group(GetBusGroupName(busId)).SendAsync("ReceiveLocationUpdate", resultDto);

                // 2. Gửi cho admin tổng
                await Clients.Group("admin-group").SendAsync("ReceiveLocationUpdate", resultDto);
            }
        }

        //private async Task CheckAndNotifyParentsAsync(int busId, double busLat, double busLng)
        //{
        //    try
        //    {
        //        // Lấy thông tin lịch trình của xe bus để biết tuyến đường
        //        var schedule = await _context.Schedules
        //            .Include(s => s.Route)
        //                .ThenInclude(r => r.StopPoints)
        //                    .ThenInclude(sp => sp.Students)
        //            .Include(s => s.Driver)
        //            .Where(s => s.BusId == busId)
        //            .FirstOrDefaultAsync();

        //        if (schedule?.Route == null || schedule.Driver == null) return;

        //        // Lấy UserId của tài xế để làm người gửi thông báo
        //        var driverUserId = schedule.Driver.UserId;

        //        // Lấy danh sách các điểm dừng của tuyến đường
        //        var stopPoints = schedule.Route.StopPoints.ToList();

        //        foreach (var stopPoint in stopPoints)
        //        {
        //            // Tính khoảng cách giữa xe bus và điểm dừng
        //            var distance = GeoLocationHelper.CalculateDistance(
        //                busLat, busLng,
        //                stopPoint.Latitude, stopPoint.Longitude
        //            );

        //            // Cache key để theo dõi đã gửi thông báo chưa
        //            var cacheKey = $"NotificationSent_Bus{busId}_Stop{stopPoint.Id}";

        //            // Nếu xe bus đến gần điểm dừng (trong vòng PROXIMITY_THRESHOLD mét)
        //            if (distance <= PROXIMITY_THRESHOLD)
        //            {
        //                // Kiểm tra xem đã gửi thông báo chưa
        //                if (!_cache.TryGetValue(cacheKey, out bool _))
        //                {
        //                    _logger.LogWarning("Gửi tin nhắn thành công");
        //                    // Lấy danh sách học sinh tại điểm dừng này
        //                    var students = stopPoint.Students.ToList();

        //                    if (students.Any())
        //                    {
        //                        // Lấy danh sách UserId của phụ huynh (từ Student.UserId)
        //                        var parentUserIds = students.Select(s => s.UserId).ToList();

        //                        // Tạo thông báo
        //                        var notification = new NotificationDto
        //                        {
        //                            Title = "Xe buýt sắp đến!",
        //                            Message = $"Xe buýt đang cách điểm đón '{stopPoint.PointName}' khoảng {Math.Round(distance)}m. Vui lòng chuẩn bị!",
        //                            NotificationType = Shared.Constants.AnnouncementType.Info
        //                        };

        //                        // Gửi thông báo với UserId của tài xế
        //                        await _notificationService.SendNotificationToUsersAsync(
        //                            parentUserIds,
        //                            notification,
        //                            driverUserId
        //                        );

        //                        // Đánh dấu đã gửi thông báo cho điểm dừng này
        //                        // Cache sẽ tự động xóa sau 30 phút
        //                        _cache.Set(cacheKey, true, TimeSpan.FromMinutes(30));


        //                    }
        //                }
        //            }
        //            else if (distance > RESET_THRESHOLD)
        //            {
        //                // Nếu xe bus đã đi xa khỏi điểm dừng, xóa cache để có thể gửi lại lần sau
        //                _cache.Remove(cacheKey);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log lỗi nếu cần
        //        Console.WriteLine($"Error in CheckAndNotifyParentsAsync: {ex.Message}");
        //    }
        //}

        private string GetBusGroupName(int busId) => $"Bus-{busId}";

        //public record BusLastLocationDTO(
        //    double Lat,
        //    double Lng,
        //    int BusId,
        //    int? RouteId,
        //    string? RouteName
        //);
    }
}
