using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Services.Interfaces;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;
using TrackingBusSystem.Infrastructure.Hubs;
using TrackingBusSystem.Infrastructure.Repositories;
using TrackingBusSystem.Infrastructure.Services;

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

                });
            });

            // 2. THÊM ĐOẠN NÀY ĐỂ SỬ DỤNG IDENTITY
            services.AddIdentityCore<AppUser>(options =>
            {
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireDigit = false;

            })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();
            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<AppDbContext>());
            services.AddScoped<IRouteRepository, RouteRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IDriverRepository, DriverRepository>();
            services.AddScoped<IScheduleRepository, ScheduleRepository>();
            services.AddScoped<IBusRepository, BusRepository>();
            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<INotificationService, NotificationService>();
            // Đăng ký Interface và Class thực thi
            services.AddScoped<IBusTrackingService, BusTrackingService>();

            services.AddSingleton(typeof(ILogger<>), typeof(Logger<>));
            services.AddDataProtection();


            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new()
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"] ?? ""))
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            // 1. Kiểm tra Authorization header (ưu tiên cao nhất)
                            var authHeader = context.Request.Headers["Authorization"].ToString();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                            {
                                context.Token = authHeader.Substring("Bearer ".Length).Trim();
                            }
                            // 2. Kiểm tra query string (cho SignalR)
                            else if (context.Request.Query.ContainsKey("access_token"))
                            {
                                var accessToken = context.Request.Query["access_token"];
                                context.Token = accessToken;
                            }
                            // 3. Fallback: lấy từ cookie
                            else
                            {
                                context.Token = context.Request.Cookies["access_token"] ?? "";
                            }
                            return Task.CompletedTask;
                        }
                    };
                });


            return services;
        }

        public static void UseInfrastructureService(this WebApplication app)
        {

            app.MapHub<GeolocationHub>("/geolocationHub");
            app.MapHub<NotificationHub>("/notificationHub");

        }
    }
}
