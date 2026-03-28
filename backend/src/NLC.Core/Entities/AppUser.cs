using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class AppUser
{
    public Guid      Id                   { get; set; } = Guid.NewGuid();
    public string    Email                { get; set; } = default!;
    public string    Name                 { get; set; } = default!;
    public string    PasswordHash         { get; set; } = default!;
    public UserRole  Role                 { get; set; } = UserRole.viewer;
    public Guid[]    AssignedWarehouseIds { get; set; } = [];
    public bool      IsActive             { get; set; } = true;
    public DateTime  CreatedAt            { get; set; } = DateTime.UtcNow;
}
