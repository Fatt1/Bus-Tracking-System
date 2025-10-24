using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Command.DeleteDriver
{
    public record DeleteDriverByIdCommand(int Id) : ICommand
    {
    }
    public class DeleteDriverByIdCommandHandler : ICommandHandler<DeleteDriverByIdCommand>
    {
        public DeleteDriverByIdCommandHandler()
        {
        }
        public Task<Result> Handle(DeleteDriverByIdCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
