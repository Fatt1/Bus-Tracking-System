using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Buses.Query.GetDetailBusById
{
    public record GetBusDetailByIdQuery(int Id) : IQuery<GetBusDetailDTO>
    {

    }
    public class GetBusDetailByIdQueryHandler : IQueryHandler<GetBusDetailByIdQuery, GetBusDetailDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        private readonly IMapper _mapper;
        public GetBusDetailByIdQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public async Task<Result<GetBusDetailDTO>> Handle(GetBusDetailByIdQuery request, CancellationToken cancellationToken)
        {
            var bus = await _dbContext.Buses.Where(b => b.Id == request.Id).ProjectTo<GetBusDetailDTO>(_mapper.ConfigurationProvider).FirstOrDefaultAsync();
            if (bus == null)
            {
                return Result<GetBusDetailDTO>.Failure(BusErrors.BusNotFound(request.Id));
            }
            return Result<GetBusDetailDTO>.Success(bus);
        }
    }

}
