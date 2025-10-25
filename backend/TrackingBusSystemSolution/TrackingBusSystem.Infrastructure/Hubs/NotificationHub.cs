using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Infrastructure.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            if (Context!.User!.IsInRole(Roles.Admin.ToString()))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, Roles.Admin.ToString());
            }

            await base.OnConnectedAsync();
        }
    }
}
