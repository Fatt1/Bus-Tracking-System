using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;
using TrackingBusSystem.Infrastructure.Repositories;

namespace TrackingBusSystem.Infrastructure.Dependency_Injection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastureService(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ServiceContainer).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(); // Tự động thử lại nếu thất bại cho transient failures
                });
            });

            // Add dependencies
            services.AddScoped<IRouteRepository, RouteRepository>();
            return services;
        }
    }
}
