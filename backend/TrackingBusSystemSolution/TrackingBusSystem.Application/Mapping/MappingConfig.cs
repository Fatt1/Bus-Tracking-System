using AutoMapper;
using TrackingBusSystem.Application.Features.Buses.DTOs;
using TrackingBusSystem.Application.Features.Drivers.DTOs;
using TrackingBusSystem.Application.Features.Routes.DTOs;
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
           .ForMember(dest => dest.DriverId, opt => opt.MapFrom(src => src.Driver.Id));

            CreateMap<Driver, GetDriverDTO>();


        }
    }
}
