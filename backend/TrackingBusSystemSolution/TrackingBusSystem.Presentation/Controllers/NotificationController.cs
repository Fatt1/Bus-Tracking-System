using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TrackingBusSystem.Application.Abstractions.Common.DTOs;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Features.Notification.Command;
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

        /// <summary>
        /// Lấy chi tiết thông báo và tự động đánh dấu đã đọc (nếu chưa đọc)
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetNotificationDetail(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Bước 1: Update IsRead = true nếu chưa đọc
            var updateResult = await _meditor.Send(new UpdateReadStatusNotificationCommand(id, userId!));
            if (updateResult.IsFailure)
            {
                return NotFound(updateResult.Error);
            }

            // Bước 2: Lấy chi tiết thông báo
            var detailResult = await _meditor.Send(new GetNotificationDetailQuery(id, userId!));
            if (detailResult.IsFailure)
            {
                return NotFound(detailResult.Error);
            }

            // Trả về kèm thông tin đã update hay chưa
            return Ok(new
            {
                notification = detailResult.Value,
                wasUpdated = updateResult.Value // true = vừa mới đánh dấu đã đọc, false = đã đọc từ trước
            });
        }

        /// <summary>
        /// Chỉ update IsRead mà không lấy chi tiết (tùy chọn)
        /// </summary>
        [HttpPatch("{id:int}/mark-as-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _meditor.Send(new UpdateReadStatusNotificationCommand(id, userId!));

            if (result.IsFailure)
            {
                return NotFound(result.Error);
            }

            return Ok(new
            {
                message = result.Value ? "Đã đánh dấu đã đọc" : "Thông báo đã được đọc trước đó",
                wasUpdated = result.Value
            });
        }


        [HttpDelete("sent-noti/{id:int}")]
        public async Task<IActionResult> DeleteSentNotification(int id)
        {
            var result = await _meditor.Send(new DeleteSentNotificationCommand(id));
            if (result.IsFailure)
            {
                return NotFound(result.Error);
            }
            return Ok();
        }

        [HttpDelete("receive-noti/{id:int}")]
        public async Task<IActionResult> DeleteReceiveNotification(int id)
        {
            var result = await _meditor.Send(new DeleteReceiveNotificationCommand(id));
            if (result.IsFailure)
            {
                return NotFound(result.Error);
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
