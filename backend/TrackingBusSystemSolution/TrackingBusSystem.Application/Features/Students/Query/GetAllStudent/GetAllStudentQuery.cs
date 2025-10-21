using AutoMapper;
using AutoMapper.QueryableExtensions;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Students.Query.GetAllStudent
{
    public record GetAllStudentQuery : QueyStringParameters, IQuery<PagedList<GetAllStudentDTO>>
    {
    }

    public class GetAllStudentQueryHandler : IQueryHandler<GetAllStudentQuery, PagedList<GetAllStudentDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        private readonly IMapper _mapper;
        public GetAllStudentQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public Task<Result<PagedList<GetAllStudentDTO>>> Handle(GetAllStudentQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Students.ProjectTo<GetAllStudentDTO>(_mapper.ConfigurationProvider);
            var pagedStudents = PagedList<GetAllStudentDTO>.ToPagedList(query, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetAllStudentDTO>>.Success(pagedStudents));
        }
    }
}
