using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Schedules.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Schedules.Query
{
    public record GetAllScheduleQuery : QueyStringParameters, IQuery<PagedList<GetAllScheduleDTO>>
    {
    }
    public class GetAllScheduleQueryHandler : IQueryHandler<GetAllScheduleQuery, PagedList<GetAllScheduleDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetAllScheduleQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public Task<Result<PagedList<GetAllScheduleDTO>>> Handle(GetAllScheduleQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Schedules
                 .Select(s => new GetAllScheduleDTO
                 {
                     Id = s.Id,
                     ScheduleName = s.ScheduleName,
                     ScheduleType = s.ScheduleType.ToString(),
                     StartDate = s.StartDate,
                     EndDate = s.EndDate,
                     Status = s.Status.ToString()
                 });
            var pagedSchedules = PagedList<GetAllScheduleDTO>.ToPagedList(query, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetAllScheduleDTO>>.Success(pagedSchedules));
        }
    }
}
