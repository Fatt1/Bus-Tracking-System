using MediatR;
using Microsoft.AspNetCore.SignalR;
using TrackingBusSystem.Application.Features.Buses.Command;

namespace TrackingBusSystem.Infrastructure.Hubs
{
    public class GeolocationHub : Hub
    {
        private readonly IMediator _mediator;
        public GeolocationHub(IMediator mediator)
        {
            _mediator = mediator;
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

        public async Task SendLocation(int busId, double lat, double lng)
        {
            var result = await _mediator.Send(new BusLocationUpdateCommand { BusId = busId, Latitude = lat, Longitude = lng });
            var busLastLocationDto = new BusLastLocationDTO(lat, lng, busId);

            await Clients.Group(GetBusGroupName(busId)).SendAsync("ReceiveLocationUpdate", busLastLocationDto);
            // 2. Gửi cho nhóm admin

            await Clients.Group("admin-group").SendAsync("ReceiveLocationUpdate", busLastLocationDto);
        }

        private string GetBusGroupName(int busId) => $"Bus-{busId}";

        public record BusLastLocationDTO(
            double Lat,
            double Lng,
            int BusId
        );
    }
}
