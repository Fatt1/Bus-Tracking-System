namespace TrackingBusSystem.Application.DTOs
{
    // Record này tự động có các thuộc tính 'init' cho Id, RouteName, v.v.
    public record GetRoutesResponse(
        int Id,
        string RouteName,
        string RouteDescription,
        IReadOnlyCollection<PointResponse> Points // Nên dùng IReadOnlyCollection<T> để thể hiện rõ hơn tính bất biến
    );

    //---

    // Record này tự động có các thuộc tính 'init' cho Id, NamePoint, v.v.
    public record PointResponse(
        int Id,
        string NamePoint,
        double Latitude,
        double Longitude
    );
}
