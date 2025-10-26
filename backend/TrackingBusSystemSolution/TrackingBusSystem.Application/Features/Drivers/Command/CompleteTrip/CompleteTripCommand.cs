using AutoMapper;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Drivers.Command.CompleteTrip
{
    public record CompleteTripCommand : ICommand
    {
        public List<CompleTripStudentsDTO> StudentsDTOs { get; init; } = new List<CompleTripStudentsDTO>();
    }

    public class CompleteTripCommandHandler : ICommandHandler<CompleteTripCommand>
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public CompleteTripCommandHandler(IScheduleRepository scheduleRepository, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _scheduleRepository = scheduleRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(CompleteTripCommand request, CancellationToken cancellationToken)
        {
            var studentCheckingHistores = _mapper.Map<List<StudentCheckingHistory>>(request.StudentsDTOs);
            try
            {
                await _scheduleRepository.AddRangeAsyncStudentCheckingHistory(studentCheckingHistores);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure(new Error("SqlException.CantAdd", ex.Message));
            }

        }
    }
}
