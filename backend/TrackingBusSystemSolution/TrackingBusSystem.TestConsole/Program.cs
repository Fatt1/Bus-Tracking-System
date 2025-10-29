using Microsoft.AspNetCore.SignalR.Client;

namespace TrackingBusSystem.TestConsole
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            string hubUrl = "https://localhost:7229/geolocationHub";
            var connection = new HubConnectionBuilder()
                .WithUrl(hubUrl)
                .WithAutomaticReconnect()
                .Build();


            // Kết nối đến NotificationHub để nhận thông báo
            string notificationHubUrl = "https://localhost:7229/notificationHub";
            var notificationConnection = new HubConnectionBuilder()
                .WithUrl(notificationHubUrl)
                .WithAutomaticReconnect()
                .Build();


            Console.WriteLine("=== TEST GỬI THÔNG BÁO KHI XE BUS ĐẾN GẦN ĐIỂM DỪNG ===\n");

            // LẮNG NGHE SỰ KIỆN NHẬN VỊ TRÍ
            connection.On("ReceiveLocationUpdate", (LocationDto location) =>
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"📍 Vị trí mới từ Bus {location.BusId}: Lat={location.Lat:F6}, Lng={location.Lng:F6}");
                Console.ResetColor();
            });

            // LẮNG NGHE SỰ KIỆN NHẬN THÔNG BÁO (Phụ huynh)
            notificationConnection.On("ReceiveNotification", (NotificationDto notification) =>
            {
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine("\n" + new string('=', 60));
                Console.WriteLine("🔔 THÔNG BÁO MỚI:");
                Console.WriteLine($"   Tiêu đề: {notification.Title}");
                Console.WriteLine($"   Nội dung: {notification.Message}");
                Console.WriteLine($"   Loại: {notification.NotificationType}");
                Console.WriteLine(new string('=', 60) + "\n");
                Console.ResetColor();
            });

            // Bắt đầu kết nối
            try
            {
                await connection.StartAsync();
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"✅ Kết nối thành công tới Hub!");
                Console.WriteLine($"   ConnectionId: {connection.ConnectionId}\n");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Kết nối thất bại: {ex.Message}");
                Console.ResetColor();
                return;
            }

            // Bắt đầu kết nối NotificationHub
            try
            {
                await notificationConnection.StartAsync();
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"✅ Kết nối NotificationHub thành công!");
                Console.WriteLine($"   ConnectionId: {notificationConnection.ConnectionId}\n");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Kết nối NotificationHub thất bại: {ex.Message}");
                Console.ResetColor();
                // Vẫn tiếp tục nếu NotificationHub lỗi
            }

            // Tham gia nhóm admin để nhận tất cả thông báo
            await connection.InvokeAsync("JoinAdminGroup");
            Console.WriteLine("👤 Đã tham gia nhóm 'admin-group'\n");

            // Menu lựa chọn
            Console.WriteLine("CHỌN CHẾ ĐỘ TEST:");
            Console.WriteLine("1. Test tự động (xe bus tiến dần đến điểm dừng)");
            Console.WriteLine("2. Test thủ công (nhập tọa độ)");
            Console.Write("\nNhập lựa chọn (1 hoặc 2): ");
            var choice = Console.ReadLine();

            if (choice == "1")
            {
                await TestAutoMode(connection);
            }
            else
            {
                await TestManualMode(connection);
            }
        }

        /// <summary>
        /// Test tự động: Giả lập xe bus di chuyển từ xa đến gần điểm dừng
        /// </summary>
        static async Task TestAutoMode(HubConnection connection)
        {
            Console.WriteLine("\n=== CHẾ ĐỘ TỰ ĐỘNG ===");
            Console.Write("Nhập Bus ID để test (ví dụ: 1, 2, 3...): ");
            if (!int.TryParse(Console.ReadLine(), out int busId))
            {
                busId = 1;
            }

            // Tham gia nhóm bus
            await connection.InvokeAsync("JoinBusGroup", busId);

            Console.WriteLine($"\n🚌 Bắt đầu giả lập xe bus {busId} di chuyển...");
            Console.WriteLine("📌 LƯU Ý: Cần có dữ liệu trong DB với:");
            Console.WriteLine($"   - Bus ID: {busId}");
            Console.WriteLine("   - Schedule với Bus này");
            Console.WriteLine("   - Route có StopPoints");
            Console.WriteLine("   - Students tại các StopPoints\n");

            // Điểm xuất phát (xa điểm dừng)
            // Ví dụ: Điểm dừng ở (10.7530, 106.6925), bắt đầu từ (10.75, 106.68)
            double startLat = 10.75;
            double startLng = 106.68;

            // Điểm đích (gần một điểm dừng trong DB của bạn)
            // THAY ĐỔI THEO TỌA ĐỘ THỰC TẾ TRONG DATABASE
            double targetLat = 10.819555;
            double targetLng = 106.630731;

            int steps = 50; // Số bước di chuyển
            double latStep = (targetLat - startLat) / steps;
            double lngStep = (targetLng - startLng) / steps;

            Console.WriteLine($"📍 Điểm xuất phát: ({startLat:F6}, {startLng:F6})");
            Console.WriteLine($"🎯 Điểm đích: ({targetLat:F6}, {targetLng:F6})");
            Console.WriteLine($"🔢 Số bước: {steps}");
            Console.WriteLine("\nNhấn ENTER để bắt đầu, 'q' để dừng...\n");

            if (Console.ReadKey(true).Key == ConsoleKey.Q) return;

            for (int i = 0; i <= steps; i++)
            {
                double currentLat = startLat + (latStep * i);
                double currentLng = startLng + (lngStep * i);

                // Tính khoảng cách còn lại
                double distance = CalculateDistance(currentLat, currentLng, targetLat, targetLng);

                try
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"[Bước {i + 1}/{steps}] Gửi vị trí: ({currentLat:F6}, {currentLng:F6}) - Còn cách đích: {distance:F0}m");
                    Console.ResetColor();

                    await connection.InvokeAsync("SendLocation", busId, currentLat, currentLng);
                    await Task.Delay(500); // Đợi 500ms giữa mỗi lần gửi

                    // Dừng lại khi đến gần điểm dừng (trong vòng 100m)
                    if (distance < 100)
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine($"\n✅ Đã đến gần điểm dừng (< 100m). Dừng test.");
                        Console.ResetColor();
                        break;
                    }
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"❌ Lỗi khi gửi: {ex.Message}");
                    Console.ResetColor();
                }
            }

            Console.WriteLine("\n✅ Hoàn thành test tự động. Nhấn phím bất kỳ để thoát...");
            Console.ReadKey();
        }

        /// <summary>
        /// Test thủ công: Nhập tọa độ từ bàn phím
        /// </summary>
        static async Task TestManualMode(HubConnection connection)
        {
            Console.WriteLine("\n=== CHẾ ĐỘ THỦ CÔNG ===");
            Console.Write("Nhập Bus ID: ");
            if (!int.TryParse(Console.ReadLine(), out int busId))
            {
                busId = 1;
            }

            await connection.InvokeAsync("JoinBusGroup", busId);
            Console.WriteLine($"✅ Đã tham gia nhóm Bus-{busId}\n");

            Console.WriteLine("Nhấn ENTER để gửi vị trí, 'q' để thoát.\n");

            while (true)
            {
                var key = Console.ReadKey(true);
                if (key.Key == ConsoleKey.Q) break;

                try
                {
                    Console.Write("Nhập Latitude: ");
                    if (!double.TryParse(Console.ReadLine(), out double lat))
                    {
                        Console.WriteLine("❌ Latitude không hợp lệ!");
                        continue;
                    }

                    Console.Write("Nhập Longitude: ");
                    if (!double.TryParse(Console.ReadLine(), out double lng))
                    {
                        Console.WriteLine("❌ Longitude không hợp lệ!");
                        continue;
                    }

                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"\n[Xe Bus {busId} GỬI]: Vị trí ({lat}, {lng})");
                    Console.ResetColor();

                    await connection.InvokeAsync("SendLocation", busId, lat, lng);
                    Console.WriteLine("✅ Đã gửi!\n");
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"❌ Gửi thất bại: {ex.Message}");
                    Console.ResetColor();
                }
            }
        }

        /// <summary>
        /// Tính khoảng cách giữa 2 điểm (Haversine Formula)
        /// </summary>
        static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double earthRadius = 6371000; // mét

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return earthRadius * c;
        }

        static double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }

    public class LocationDto
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
        public int BusId { get; set; }
    }

    public class NotificationDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int NotificationType { get; set; }
    }
}
