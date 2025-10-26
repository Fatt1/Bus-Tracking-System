using AutoMapper;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Application.Features.Schedules.Command.UpdateSchedule;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Application.Mapping
{
    public class MappingConfig : Profile
    {
        public MappingConfig()
        {
            CreateMap<Route, GetRoutesResponse>();

            CreateMap<StopPoint, PointResponse>();
            CreateMap<BusLastLocation, BusLastLocationDTO>();
            CreateMap<Bus, GetAllBusesDTO>();



            CreateMap<Driver, GetDriverDTO>();
            CreateMap<Driver, CreateDriverDTO>();
            CreateMap<Student, CreateStudentDTO>();

            CreateMap<UpdateScheduleByIdCommand, Schedule>();
            CreateMap<CompleTripStudentsDTO, StudentCheckingHistory>();


        }
    }
}
