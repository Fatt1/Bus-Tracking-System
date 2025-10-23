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

        public GetAllStudentQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;

        }
        public Task<Result<PagedList<GetAllStudentDTO>>> Handle(GetAllStudentQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Students.Select(s => new GetAllStudentDTO
            {
                Id = s.Id,
                FullName = s.User.LastName + " " + s.User.FirstName,
                Class = s.Class,
                Address = s.Address,
                ParentName = s.ParentName,
                ParentPhoneNumber = s.User.PhoneNumber!
            }).AsQueryable();
            var pagedStudents = PagedList<GetAllStudentDTO>.ToPagedList(query, request.PageNumber, request.PageSize);
            return Task.FromResult(Result<PagedList<GetAllStudentDTO>>.Success(pagedStudents));
        }
    }
}
