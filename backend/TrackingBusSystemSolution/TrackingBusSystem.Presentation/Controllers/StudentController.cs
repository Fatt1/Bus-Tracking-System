using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TrackingBusSystem.Application.Features.Students.Command.CreateStudent;
using TrackingBusSystem.Application.Features.Students.Command.DeleteStudent;
using TrackingBusSystem.Application.Features.Students.Command.UpdateStudent;
using TrackingBusSystem.Application.Features.Students.Query.GetAllStudent;
using TrackingBusSystem.Application.Features.Students.Query.GetAllStudentsWithoutPagination;
using TrackingBusSystem.Application.Features.Students.Query.GetBusLocation;
using TrackingBusSystem.Application.Features.Students.Query.GetStudentById;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/student")]
    [ApiController]
    public class StudentController(IMediator mediator) : ControllerBase
    {
        [HttpPost("create")]
        public async Task<IActionResult> CreateStudent(CreateStudentCommand request)
        {
            var result = await mediator.Send(request);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetStudentById), new { id = result.Value.Id }, result.Value);
            }
            return BadRequest(result.Error);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetStudentById(int id)
        {
            var result = await mediator.Send(new GetStudentByIdQuery(id));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return NotFound(result.Error);
        }

        [HttpGet("all-without-pagination")]
        public async Task<IActionResult> GetAllStudentsWithoutPagination()
        {
            var result = await mediator.Send(new GetAllStudentWithoutPaginationQuery());
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllStudents([FromQuery] GetAllStudentQuery request)
        {
            var result = await mediator.Send(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [Authorize(Roles = "Parent")]
        [HttpGet("schedule-today")]
        public async Task<IActionResult> GetStudentScheduleToday()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var result = await mediator.Send(new Application.Features.Students.Query.GetStudentScheduleQuery(userId));
            if (result.Value == null)
            {
                return Ok("No schedule found for today.");
            }
            return Ok(result.Value);
        }

        [HttpGet("bus-location-today")]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetBusLocationToday()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var result = await mediator.Send(new GetBusLocationQuery(userId));
            if (result.Value == null)
            {
                return Ok("No bus location found for today.");
            }
            return Ok(result.Value);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentByIdCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest("ID in URL does not match ID in body");
            }
            var result = await mediator.Send(request);
            if (result.IsSuccess)
            {
                return NoContent();
            }
            return BadRequest(result.Error);
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var result = await mediator.Send(new DeleteStudentByIdCommand(id));
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return NoContent();
        }
    }
}
