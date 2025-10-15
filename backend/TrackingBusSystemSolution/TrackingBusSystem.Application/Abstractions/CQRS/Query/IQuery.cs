using MediatR;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Abstractions.CQRS.Query
{
    public interface IQuery<TResposne> : IRequest<Result<TResposne>>
    {
    }
    public interface IQueryHandler<TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>> where TQuery : IQuery<TResponse>
    {
    }
}
