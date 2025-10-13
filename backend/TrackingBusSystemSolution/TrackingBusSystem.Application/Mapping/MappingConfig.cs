using AutoMapper;
using TrackingBusSystem.Application.DTOs;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Application.Mapping
{
    public class MappingConfig : Profile
    {
        public MappingConfig()
        {
            CreateMap<Route, GetRoutesResponse>();
            CreateMap<Point, PointResponse>();
        }
    }
}
