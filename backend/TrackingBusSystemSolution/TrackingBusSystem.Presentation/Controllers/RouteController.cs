using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutes;
using TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutesToday;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/route/")]
    [ApiController]
    public class RouteController(IMediator mediator) : ControllerBase
    {
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRoutes([FromQuery] GetAllRoutesQuery request)
        {
            var result = await mediator.Send(request);
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Error);
        }


        [HttpGet("all/today")]
        public async Task<IActionResult> GetAllRoutesToday()
        {
            var result = await mediator.Send(new GetAllRoutesTodayQuery());
            return Ok(result.Value);
        }

    }
}
