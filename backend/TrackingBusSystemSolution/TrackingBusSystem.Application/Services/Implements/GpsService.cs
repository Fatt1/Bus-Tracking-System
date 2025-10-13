using TrackingBusSystem.Application.Services.Interfaces;

namespace TrackingBusSystem.Application.Services.Implements
{
    public class GpsService() : IGpsService
    {
        public async Task ProcessGpsUpdate(double lat, double lng)
        {
            throw new NotImplementedException();
        }
    }
}
