namespace TrackingBusSystem.Application.Abstractions.Common.DTOs
{
    public record BusLastLocationDTO(
            double Lat,
            double Lng,
            int BusId,
            int? RouteId,
            string? RouteName,
            string? TripType
        );
}
