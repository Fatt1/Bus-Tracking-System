using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Buses.Command;
using TrackingBusSystem.Application.Features.Buses.Query.GetAllBuses;
using TrackingBusSystem.Application.Features.Buses.Query.GetAllBusSimple;
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
            return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
        }

        [HttpGet("all/simple")]
        public async Task<IActionResult> GetAllBusSimple()
        {
            var result = await _mediator.Send(new GetAllBusSimpleQuery());
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateBus([FromBody] CreateBusCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetBusById), new { id = result.Value.Id }, result.Value);
            }
            // Xử lý lỗi
            return BadRequest(result.Error);
        }
    }
}
