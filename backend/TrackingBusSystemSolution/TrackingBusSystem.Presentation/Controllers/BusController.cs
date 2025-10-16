using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Buses.Query.GetAllBuses;
using TrackingBusSystem.Application.Features.Buses.Query.GetDetailBusById;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/bus")]
    [ApiController]
    public class BusController : ControllerBase
    {
        private readonly IMediator _mediator;
        public BusController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllBuses([FromQuery] GetAllBusesQuery request)
        {
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBusById(int id)
        {
            var result = await _mediator.Send(new GetBusDetailByIdQuery(id));
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }
    }
}
