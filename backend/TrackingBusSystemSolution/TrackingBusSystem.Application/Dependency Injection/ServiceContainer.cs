using Microsoft.Extensions.DependencyInjection;
using TrackingBusSystem.Application.Mapping;
using TrackingBusSystem.Application.Services.Implements;
using TrackingBusSystem.Application.Services.Interfaces;

namespace TrackingBusSystem.Application.Dependency_Injection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddApplicationService(this IServiceCollection services)
        {
            services.AddAutoMapper(configAction =>
            {
                configAction.AddProfile<MappingConfig>();
            });
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ServiceContainer).Assembly));
            services.AddScoped<IRouteService, RouteService>();
            services.AddScoped<IGpsService, GpsService>();

            return services;
        }
    }
}
