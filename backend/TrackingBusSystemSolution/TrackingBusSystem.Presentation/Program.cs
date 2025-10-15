
using TrackingBusSystem.Application.Dependency_Injection;
using TrackingBusSystem.Infrastructure.Dependency_Injection;
using TrackingBusSystem.Presentation.Hubs;

namespace TrackingBusSystem.Presentation
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddInfrastureService(builder.Configuration);
            builder.Services.AddApplicationService();
            builder.Services.AddSignalR();

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(config =>
                {
                    config
                    .WithOrigins("http://127.0.0.1:5500")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();

                });
            });
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors();
            app.UseAuthorization();


            app.MapControllers();
            app.MapHub<GeolocationHub>("/geolocationHub");
            app.Run();
        }
    }
}
