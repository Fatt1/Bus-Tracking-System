using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Routes.Query.GetAllRoutes;
using TrackingBusSystem.Application.Features.Routes.Query.GetRouteByIdQuery;
using TrackingBusSystem.Application.Features.Routes.Query.GetStudents;

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
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetRouteById(int id)
        {
            var result = await mediator.Send(new GetRouteByIdQuery(id));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return NotFound(result.Error);
        }

        [HttpGet("{id:int}/students")]
        public async Task<IActionResult> GetRouteStudents(int id)
        {
            var result = await mediator.Send(new GetAllStudentByRouteIdQuery(id));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return NotFound(result.Error);
        }
    }
}
