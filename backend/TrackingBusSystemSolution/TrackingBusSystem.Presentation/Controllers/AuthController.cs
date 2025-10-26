using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Authentication;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsFailure)
            {
                return Unauthorized(result.Error);
            }

            // Lưu token vào cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(7),



            };
            Response.Cookies.Append("access_token", result.Value.Token, cookieOptions);
            return Ok(result.Value);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Cung cấp các tùy chọn đã dùng khi TẠO cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"

            };

            // Phương thức Delete sẽ tự động đặt ngày hết hạn
            Response.Cookies.Delete("access_token", cookieOptions);
            return Ok(new { Message = "Logged out successfully" });
        }

    }
}
