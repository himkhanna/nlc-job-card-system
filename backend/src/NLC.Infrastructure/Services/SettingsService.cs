using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using NLC.Application.DTOs.Settings;
using NLC.Core.Entities;
using NLC.Infrastructure.Data;

namespace NLC.Infrastructure.Services;

public class SettingsService(NlcDbContext db)
{
    // ── Warehouses ────────────────────────────────────────────────────────────
    public async Task<List<WarehouseDto>> GetWarehousesAsync()
        => await db.Warehouses
            .OrderBy(w => w.Name)
            .Select(w => new WarehouseDto(w.Id, w.Name, w.Location, w.IsActive))
            .ToListAsync();

    public async Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseRequest req)
    {
        var w = new Warehouse { Name = req.Name, Location = req.Location, IsActive = true };
        db.Warehouses.Add(w);
        await db.SaveChangesAsync();
        return new WarehouseDto(w.Id, w.Name, w.Location, w.IsActive);
    }

    public async Task<(bool ok, string error)> UpdateWarehouseAsync(Guid id, UpdateWarehouseRequest req)
    {
        var w = await db.Warehouses.FindAsync(id);
        if (w is null) return (false, "Warehouse not found");
        w.Name     = req.Name;
        w.Location = req.Location;
        w.IsActive = req.IsActive;
        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    // ── Job Type Configs ──────────────────────────────────────────────────────
    public async Task<List<JobTypeConfigDto>> GetJobTypeConfigsAsync()
        => await db.JobTypeConfigs
            .OrderBy(c => c.Name)
            .Select(c => new JobTypeConfigDto(
                c.Id, c.Name, c.Phases, c.VasOptional,
                c.GrnTriggerPhase, c.ErpPushPhase, c.IsActive))
            .ToListAsync();

    public async Task<(bool ok, string error)> UpdateJobTypeConfigAsync(Guid id, UpdateJobTypeConfigRequest req)
    {
        var c = await db.JobTypeConfigs.FindAsync(id);
        if (c is null) return (false, "Config not found");
        c.Phases          = req.Phases;
        c.VasOptional     = req.VasOptional;
        c.GrnTriggerPhase = req.GrnTriggerPhase;
        c.ErpPushPhase    = req.ErpPushPhase;
        c.IsActive        = req.IsActive;
        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    public async Task<List<AppUserDto>> GetUsersAsync()
        => await db.Users
            .OrderBy(u => u.Name)
            .Select(u => new AppUserDto(
                u.Id, u.Email, u.Name, u.Role,
                u.AssignedWarehouseIds, u.IsActive))
            .ToListAsync();

    public async Task<(bool ok, string error, AppUserDto? result)> CreateUserAsync(CreateUserRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower()))
            return (false, "Email already in use", null);

        var user = new AppUser
        {
            Email               = req.Email.ToLower(),
            Name                = req.Name,
            PasswordHash        = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role                = req.Role,
            AssignedWarehouseIds = req.AssignedWarehouseIds,
            IsActive            = true,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        var dto = new AppUserDto(user.Id, user.Email, user.Name, user.Role, user.AssignedWarehouseIds, user.IsActive);
        return (true, string.Empty, dto);
    }

    public async Task<(bool ok, string error)> UpdateUserAsync(Guid id, UpdateUserRequest req)
    {
        var u = await db.Users.FindAsync(id);
        if (u is null) return (false, "User not found");
        u.Name                = req.Name;
        u.Role                = req.Role;
        u.AssignedWarehouseIds = req.AssignedWarehouseIds;
        u.IsActive            = req.IsActive;
        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    public async Task<(bool ok, string error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest req)
    {
        var u = await db.Users.FindAsync(userId);
        if (u is null) return (false, "User not found");
        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, u.PasswordHash))
            return (false, "Current password is incorrect");
        u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync();
        return (true, string.Empty);
    }
}
