using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Drivers.Command.CompleteTrip;
using TrackingBusSystem.Application.Features.Drivers.Command.CreateDriver;
using TrackingBusSystem.Application.Features.Drivers.Command.DeleteDriver;
using TrackingBusSystem.Application.Features.Drivers.Command.UpdateDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriver;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverDropdown;
using TrackingBusSystem.Application.Features.Drivers.Query.GetAllDriverWithoutPagination;
using TrackingBusSystem.Application.Features.Drivers.Query.GetDriverById;
using TrackingBusSystem.Application.Features.Drivers.Query.GetPickupList;

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

        [HttpGet("{id:int}/pickup-schedule")]
        public async Task<IActionResult> GetPickupScheduleByDriverId(int id, [FromQuery] ScheduleQueryParams query)
        {
            var request = new GetPickupScheduleDriverByIdQuery(id, query.Date, query.PageNumber, query.PageSize);
            var result = await _mediator.Send(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpGet("no-pagination")]
        public async Task<IActionResult> GetAllDriversWithoutPagination()
        {
            var result = await _mediator.Send(new GetAllDriverWithoutPaginationQuery());
            if (result.IsSuccess) return Ok(result.Value);
            return BadRequest(result.Error);
        }

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
    }
}
