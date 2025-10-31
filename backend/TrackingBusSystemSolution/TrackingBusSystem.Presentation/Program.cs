
using TrackingBusSystem.Application.Dependency_Injection;
using TrackingBusSystem.Infrastructure.Data;
using TrackingBusSystem.Infrastructure.Dependency_Injection;

namespace TrackingBusSystem.Presentation
{
    public class Program
    {
        public static async Task Main(string[] args)
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
            builder.Services.AddMemoryCache();
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(config =>
                {
                    config
                    .WithOrigins("http://127.0.0.1:5500")
                    .WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();

                });
            });
            var app = builder.Build();

            // ===== TỰ ĐỘNG CHẠY MIGRATION VÀ SEED DATA =====
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    await DatabaseInitializer.InitializeAsync(services);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "❌ Lỗi khi khởi tạo database");

                }
            }




            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors();
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();
            app.UseInfrastructureService();
            app.Run();
        }
    }
}
