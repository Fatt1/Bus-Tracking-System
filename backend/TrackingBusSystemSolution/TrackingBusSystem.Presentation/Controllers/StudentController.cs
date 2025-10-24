using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Features.Students.Command.CreateStudent;
using TrackingBusSystem.Application.Features.Students.Query.GetAllStudent;
using TrackingBusSystem.Application.Features.Students.Query.GetAllStudentByRouteId;
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



        [HttpGet("by-route/${routeId:int}")]
        public async Task<IActionResult> GetAllStudentByRouteId([FromRoute] int routeId)
        {
            var result = await mediator.Send(new GetAllStudentByRouteIdQuery(routeId));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Error);
        }
    }
}
