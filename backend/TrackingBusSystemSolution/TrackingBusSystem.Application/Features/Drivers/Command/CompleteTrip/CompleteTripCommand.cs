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
            Console.WriteLine("=== CompleteTripCommandHandler ===");
            Console.WriteLine($"📥 Received {request.StudentsDTOs.Count} students");
            
            foreach (var dto in request.StudentsDTOs)
            {
                Console.WriteLine($"  - Student {dto.StudentId}, Schedule {dto.ScheduleId}, Status {dto.CheckingStatus}, Type {dto.Type}, StopPoint {dto.StopPointId}");
            }
            
            var studentCheckingHistores = _mapper.Map<List<StudentCheckingHistory>>(request.StudentsDTOs);
            Console.WriteLine($"✅ Mapped to {studentCheckingHistores.Count} StudentCheckingHistory entities");
            
            try
            {
                await _scheduleRepository.AddRangeAsyncStudentCheckingHistory(studentCheckingHistores);
                Console.WriteLine("✅ Added to repository");
                
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                Console.WriteLine("✅ SaveChanges completed successfully");
                
                return Result.Success();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error saving: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return Result.Failure(new Error("SqlException.CantAdd", ex.Message));
            }

        }
    }
}
