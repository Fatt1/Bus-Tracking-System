
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TrackingBusSystem.Application.Abstractions.Common.DTOs;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Features.Notification.Query;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/notificaton")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IMediator _meditor;
        public NotificationController(INotificationService notificationService, IMediator mediator)
        {
            _notificationService = notificationService;
            _meditor = mediator;
        }


        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
        {
            var fromUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var notification = new NotificationDto
            {
                Title = request.Title,
                Message = request.Message,
                NotificationType = request.NotificationType,

            };
            var result = await _notificationService.SendNotificationToUsersAsync(request.ToUserIds, notification, fromUserId!);
            if (result.IsFailure)
            {
                return BadRequest(result.Error);
            }
            return Ok();
        }

        [HttpGet("received-notifications")]
        public async Task<IActionResult> GetReceivedNotification()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _meditor.Send(new GetReceivedNotificationsQuery(userId!));
            if (result.IsSuccess) return Ok(result.Value);
            else return BadRequest(result.Error);
        }
        [HttpGet("sent-notifications")]
        public async Task<IActionResult> GetSentNotification()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _meditor.Send(new GetSentNotificationQuery(userId!));
            if (result.IsSuccess) return Ok(result.Value);
            else return BadRequest(result.Error);
        }
    }
    public record SendNotificationRequest
    {
        public List<string> ToUserIds { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public AnnouncementType NotificationType { get; set; } // "Info", "Warning", "Error"
    }
}
