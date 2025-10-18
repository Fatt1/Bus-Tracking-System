using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Schedules.Command.CreateSchedule;
using TrackingBusSystem.Application.Features.Schedules.Query;
using TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleById;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/schedule")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ScheduleController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllSchedules([FromQuery] GetAllScheduleQuery request)
        {
            var result = await _mediator.Send(request);

            return Ok(result.Value);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess)
            {
                return Ok();
            }
            return BadRequest(result.Error);
        }
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var result = await _mediator.Send(new GetScheduleByIdQuery { Id = id });
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return NotFound(result.Error);
        }
    }
}
