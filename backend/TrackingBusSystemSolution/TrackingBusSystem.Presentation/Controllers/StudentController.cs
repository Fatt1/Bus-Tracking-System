using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Students.Command.CreateStudent;
using TrackingBusSystem.Application.Features.Students.Query.GetAllStudent;

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
                return CreatedAtAction(nameof(GetStudentById), new { Id = result.Value.Id }, result.Value);
            }
            return BadRequest(result.Error);
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

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetStudentById(long id)
        {
            return Ok();
        }
    }
}
