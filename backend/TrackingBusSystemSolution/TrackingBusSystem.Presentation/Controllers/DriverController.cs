using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Drivers.Command.CreateDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverSimple;
using TrackingBusSystem.Application.Features.Drivers.Query.GetDriverById;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/driver")]
    [ApiController]
    public class DriverController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DriverController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateDriver([FromBody] CreateDriverCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetAllDrivers), new { id = result.Value.Id }, result.Value);
            }
            return BadRequest(result.Error);
        }


        [HttpGet("all")]
        public async Task<IActionResult> GetAllDrivers([FromQuery] GetAllDriverQuery request)
        {
            var result = await _mediator.Send(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpGet("all/simple")]
        public async Task<IActionResult> GetAllDriverListSimple()
        {
            var result = await _mediator.Send(new GetAllDriverSimpleQuery());
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetDriverById(int id)
        {
            var result = await _mediator.Send(new GetDriverByIdQuery(id));
            if (!result.IsSuccess)
            {
                return NotFound(result.Error);
            }
            return Ok(result.Value);

        }
    }
}
