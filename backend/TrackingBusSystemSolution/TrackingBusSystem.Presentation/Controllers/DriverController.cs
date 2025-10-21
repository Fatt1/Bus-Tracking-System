using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Drivers.Command.CreateDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverSimple;

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
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
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

    }
}
