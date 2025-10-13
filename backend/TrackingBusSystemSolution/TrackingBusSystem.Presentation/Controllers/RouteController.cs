using Microsoft.AspNetCore.Mvc;
using TrackingBusSystem.Application.Services.Interfaces;

namespace TrackingBusSystem.Presentation.Controllers
{
    [Route("api/v1/route/")]
    [ApiController]
    public class RouteController(IRouteService routeService) : ControllerBase
    {
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRoutes()
        {
            var routes = await routeService.GetRoutesAsync();
            return Ok(routes);
        }
    }
}
