using AutoMapper;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Application.Services.Interfaces;
using TrackingBusSystem.Domain.Interfaces;

namespace TrackingBusSystem.Application.Services.Implements
{
    public class RouteService(IRouteRepository routeRepository, IMapper mapper) : IRouteService
    {
        public Task<GetRoutesResponse> GetRouteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<GetRoutesResponse>> GetRoutesAsync()
        {
            var routes = await routeRepository.GetRoutesAsync();
            return mapper.Map<List<GetRoutesResponse>>(routes);

        }
    }
}
