using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TrackingBusSystem.Application.Features.Drivers.Command.CompleteTrip;
using TrackingBusSystem.Application.Features.Drivers.Command.CreateDriver;
using TrackingBusSystem.Application.Features.Drivers.Command.DeleteDriver;
using TrackingBusSystem.Application.Features.Drivers.Command.UpdateDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverDropdown;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverWithoutPagination;
using TrackingBusSystem.Application.Features.Drivers.Query.GetDriverById;
using TrackingBusSystem.Application.Features.Drivers.Query.GetPickupList;
using TrackingBusSystem.Application.Features.Drivers.Query.GetScheduleToday;

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
        [Authorize(Roles = ("Admin"))]
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

        [Authorize(Roles = "Driver")]
        [HttpPost("complete-drip")]
        public async Task<IActionResult> CompleteDrip([FromBody] CompleteTripCommand request)
        {
            var result = await _mediator.Send(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok();
        }


        [Authorize]
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

        [Authorize]
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetAllDriverListSimple([FromQuery] GetAllDriverDropdownQuery request)
        {
            var result = await _mediator.Send(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [Authorize]
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

        [Authorize(Roles = "Driver")]
        [HttpGet("pickup-student-today")]
        public async Task<IActionResult> GetPickupScheduleByDriverId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var result = await _mediator.Send(new GetPickupScheduleDriver(userId));
            if (result.IsSuccess) return Ok(result.Value);
            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Driver")]
        [HttpGet("schedule-today")]
        public async Task<IActionResult> GetScheduleToday()
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var result = await _mediator.Send(new GetScheduleTodayQuery(userId));
            if (result.Value == null)
            {
                return Ok("You have no schedule for today.");
            }
            return Ok(result.Value);
        }

        [Authorize]
        [HttpGet("no-pagination")]
        public async Task<IActionResult> GetAllDriversWithoutPagination()
        {
            var result = await _mediator.Send(new GetAllDriverWithoutPaginationQuery());
            if (result.IsSuccess) return Ok(result.Value);
            return BadRequest(result.Error);
        }


        [Authorize(Roles = ("Admin, Driver"))]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateDriver(int id, [FromBody] UpdateDriverByIdCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest("ID in URL does not match ID in body.");
            }
            request.Id = id;
            var result = await _mediator.Send(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return NoContent();
        }
        [Authorize(Roles = ("Admin"))]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteDriver(int id)
        {
            var result = await _mediator.Send(new DeleteDriverByIdCommand(id));
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return NoContent();
        }




    }
}
