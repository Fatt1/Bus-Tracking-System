using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class Driver
    {

        public int Id { get; set; }

        public string Idcard { get; set; } = null!;

        public string Address { get; set; } = null!;

        public string UserId { get; set; } = null!;

        public DriverStatus Status { get; set; }

        public bool IsDeleted { get; set; } = false;

        public virtual AppUser User { get; set; } = null!;
        public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    }

    public static class DriverErrors
    {
        public static Error BusAlreadyHasDriver => new Error("Bus.BusAlreadyHasDriver", "The bus has already driver");
        public static Error DriverNotFound(int id) => new Error("Driver.NotFound", $"The driver wit id {id} was not found.");
        public static Error PhoneNumberAlreadyInUse(string phoneNumber) => new Error("Driver.PhoneNumberAlreadyInUse", $"The phone number {phoneNumber} is already in use.");

        public static Error DriverNotAvaliable(int id, DateOnly date) => new Error(
            Code: "Driver.NotAvaliable",
            Message: $"The driver with id {id} is not avaliable ${date}."
        );
    }
}
