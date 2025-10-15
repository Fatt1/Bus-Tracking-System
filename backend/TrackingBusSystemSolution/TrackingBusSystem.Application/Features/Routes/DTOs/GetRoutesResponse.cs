namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    // Record này tự động có các thuộc tính 'init' cho Id, RouteName, v.v.
    public record GetRoutesResponse(
        int Id,
        string RouteName,
        IReadOnlyCollection<PointResponse> Points // Nên dùng IReadOnlyCollection<T> để thể hiện rõ hơn tính bất biến
    )
    {
        // Thêm constructor không tham số cho AutoMapper
        public GetRoutesResponse() : this(0, "", new List<PointResponse>()) { }
    }

    //---

    // Record này tự động có các thuộc tính 'init' cho Id, NamePoint, v.v.
    public record PointResponse(
        int Id,
        string PointName,
        double Latitude,
        double Longitude
    )
    {
        public PointResponse() : this(0, "", 0.0, 0.0) { }
    }
}
