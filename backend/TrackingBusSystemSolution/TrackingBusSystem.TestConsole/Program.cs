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

            Console.WriteLine("Đang kết nối tới Hub...");

            // 2. LẮNG NGHE SỰ KIỆN TỪ HUB (Giả lập làm Phụ huynh/Admin)

            connection.On("ReceiveLocationUpdate", (LocationDto location) =>
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"Vị trí mới từ Bus {location.BusId}: Lat={location.Lat}, Lng={location.Lng}");
                Console.ResetColor();
            });

            // Bắt đầu kết nối
            try
            {
                await connection.StartAsync();
                Console.WriteLine($"Kết nối thành công tới Hub. ConnectionId: {connection.ConnectionId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Kết nối thất bại: {ex.Message}");
                return;
            }

            // 4. THAM GIA NHÓM
            //----------------------------------
            // Giả sử chúng ta theo dõi xe với Id = 3 và cũng là admin
            int busIdToTrack = 3;
            await connection.InvokeAsync("JoinBusGroup", busIdToTrack);

            Console.WriteLine("Nhấn Enter để gửi một vị trí (giả lập tài xế). Nhấn 'q' để thoát.");
            double lat = 10.77;
            double lng = 106.70;
            while (Console.ReadKey(true).Key != ConsoleKey.Q)
            {
                try
                {
                    // Thay đổi vị trí một chút
                    lat += 0.001;
                    lng += 0.001;

                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"[Xe Bus GỬI]: Vị trí ({lat}, {lng}) với xe bus {busIdToTrack}");
                    Console.ResetColor();

                    // Gọi phương thức "SendLocation" trên Hub
                    await connection.InvokeAsync("SendLocation", busIdToTrack, lat, lng);
                    Task.Delay(1000).Wait();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Gửi thất bại: {ex.Message}");
                }
            }
        }
    }

    public class LocationDto
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
        public int BusId { get; set; }
    }
}
