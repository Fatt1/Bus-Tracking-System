using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutes;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/route/")]
    [ApiController]
    public class RouteController(IMediator mediator) : ControllerBase
    {
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRoutes()
        {
            var result = await mediator.Send(new GetAllRoutesQuery());
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Error);
        }
    }
}
