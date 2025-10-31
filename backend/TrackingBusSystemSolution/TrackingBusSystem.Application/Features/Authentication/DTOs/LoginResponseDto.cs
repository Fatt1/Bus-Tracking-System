namespace TrackingBusSystem.Application.Features.Authentication.DTOs
{
    public record LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}
