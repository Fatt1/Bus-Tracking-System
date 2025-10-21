using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutes;
using TrackingBusSystem.Application.Features.Routes.Query.GetAssigmentRoute;

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

        [HttpGet("${routeId:int}/assigments")]
        public async Task<IActionResult> GetRouteAssignment([FromRoute] int routeId)
        {
            var result = await mediator.Send(new GetAssigmentRouteQuery(routeId));
            return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
        }
    }
}
