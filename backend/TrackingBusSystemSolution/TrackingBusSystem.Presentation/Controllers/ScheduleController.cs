using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Schedules.Command.CreateSchedule;
using TrackingBusSystem.Application.Features.Schedules.Command.DeleteScheduleById;
using TrackingBusSystem.Application.Features.Schedules.Command.UpdateSchedule;
using TrackingBusSystem.Application.Features.Schedules.Query.GetAllSchedule;
using TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleById;
using TrackingBusSystem.Application.Features.Schedules.Query.GetScheduleWithHistory;
using TrackingBusSystem.Shared.Constants;


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

        [Authorize]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllSchedules([FromQuery] GetAllScheduleQuery request)
        {
            var result = await _mediator.Send(request);

            return Ok(result.Value);
        }

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var result = await _mediator.Send(new GetScheduleByIdQuery(id));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return NotFound(result.Error);

        }

        [Authorize(Roles = "Admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetScheduleById), new { id = result.Value.Id }, result.Value);
            }
            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var result = await _mediator.Send(new DeleteScheduleByIdCommand(id));
            if (result.IsSuccess)
            {
                return NoContent();
            }
            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateScheduleByIdCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest("ID in URL does not match ID in body.");
            }
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess)
            {
                return NoContent();
            }
            return BadRequest(result.Error);
        }


        [Authorize]
        [HttpGet("{id:int}/cheking-history")]
        public async Task<IActionResult> GetScheduleByIdWithCheckingHistory(int id, [FromQuery] TripDirection direction)
        {


            var result = await _mediator.Send(new GetScheduleByIdWithHistoryQuery(id, direction));

            if (result.IsSuccess)
            {

                return Ok(result.Value);
            }
            else
            {

                return NotFound(result.Error);
            }
        }
    }
}
