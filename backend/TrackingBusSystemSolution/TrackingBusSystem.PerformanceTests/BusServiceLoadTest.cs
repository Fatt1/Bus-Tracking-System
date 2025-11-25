using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using TrackingBusSystem.Application.Features.Buses.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Infrastructure.Data;
using TrackingBusSystem.Infrastructure.Services;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.PerformanceTests
{

    public class BusServiceLoadTest
    {
        [Fact]
        public async Task ProcessLocationUpdate_Should_Handle_300_Concurrent_Buses()
        {
            // --- ARRANGE ---

            var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"LoadTestDb_{Guid.NewGuid()}")
                .Options;

            using (var seedContext = new AppDbContext(dbOptions))
            {
                for (int i = 1; i <= 300; i++)
                {
                    seedContext.Schedules.Add(new Schedule
                    {
                        Id = i,
                        BusId = i,
                        ScheduleDate = DateOnly.FromDateTime(DateTime.Today),
                        Route = new Route { Id = i, RouteName = $"Tuyến số {i}", StopPoints = new List<StopPoint>() },
                        Driver = new Driver { UserId = $"driver-{i}", Address = "aaa", Idcard = "111" }
                    });
                }
                await seedContext.SaveChangesAsync();
            }

            // 1. SETUP MOCK MEDIATOR (QUAN TRỌNG)
            var mockMediator = new Mock<IMediator>();


            mockMediator
                .Setup(m => m.Send(It.IsAny<BusLocationUpdateCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(Result.Success()); // Hoặc Returns(Task.CompletedTask) tùy phiên bản MediatR

            var mockServiceScopeFactory = new Mock<IServiceScopeFactory>();
            var mockLogger = new Mock<ILogger<BusTrackingService>>();
            var realCache = new MemoryCache(new MemoryCacheOptions());

            // --- ACT ---

            var tasks = new List<Task>();

            for (int i = 1; i <= 300; i++)
            {
                int busId = i;
                tasks.Add(Task.Run(async () =>
                {
                    using var localContext = new AppDbContext(dbOptions);
                    var localService = new BusTrackingService(
                        mockServiceScopeFactory.Object, mockMediator.Object, localContext, realCache, mockLogger.Object
                    );

                    double lat = 10.762 + (i * 0.0001);
                    double lng = 106.660 + (i * 0.0001);

                    await localService.ProcessLocationUpdateAsync(busId, lat, lng, "Go");
                }));
            }

            await Task.WhenAll(tasks);


            mockMediator.Verify(x => x.Send(
                It.IsAny<BusLocationUpdateCommand>(),
                It.IsAny<CancellationToken>()
            ), Times.Exactly(300));
        }
    }
}