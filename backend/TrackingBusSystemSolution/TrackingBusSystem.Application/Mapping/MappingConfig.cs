using AutoMapper;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Application.Features.Routes.DTOs;
using TrackingBusSystem.Application.Features.Students.DTOs;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Application.Mapping
{
    public class MappingConfig : Profile
    {
        public MappingConfig()
        {
            CreateMap<Route, GetRoutesResponse>();

            CreateMap<Point, PointResponse>();
            CreateMap<BusLastLocation, BusLastLocationDTO>();
            CreateMap<Bus, GetAllBusesDTO>()
            .ForMember(dest => dest.DriverName, opt => opt.MapFrom(src => src.Driver.User.FullName))
            .ForMember(dest => dest.DriverId, opt => opt.MapFrom(src => src.Driver.Id));

            CreateMap<Bus, GetBusDetailDTO>()
           .ForMember(dest => dest.DriverName, opt => opt.MapFrom(src => src.Driver.User.FullName))
           .ForMember(dest => dest.RouteName, opt => opt.MapFrom(src => src.Route.RouteName));


            CreateMap<Driver, GetDriverDTO>();
            CreateMap<Driver, CreateDriverDTO>();
            CreateMap<Student, CreateStudentDTO>();

            CreateMap<Student, GetAllStudentDTO>().ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName));

        }
    }
}
