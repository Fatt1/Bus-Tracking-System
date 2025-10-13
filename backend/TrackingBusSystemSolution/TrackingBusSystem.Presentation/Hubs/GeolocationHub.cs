using Microsoft.AspNetCore.SignalR;
using TrackingBusSystem.Application.Services.Interfaces;

namespace TrackingBusSystem.Presentation.Hubs
{
    public class GeolocationHub : Hub
    {
        private readonly IGpsService _gpsService;
        public GeolocationHub(IGpsService gpsService)
        {
            _gpsService = gpsService;
        }
        public async Task UpdateIndex(double lat, double lng, int busId)
        {
            await Clients.All.SendAsync("ReceiveBusLocation", lat, lng, busId);
        }
    }
}
