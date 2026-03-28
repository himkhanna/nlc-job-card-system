using System.Security.Claims;
using NLC.Application.DTOs.Settings;
using NLC.Infrastructure.Services;

namespace NLC.API.Endpoints;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        // ── Warehouses (admin only) ───────────────────────────────────────────
        var wh = app.MapGroup("/api/settings/warehouses").WithTags("Settings")
            .RequireAuthorization("RequireAdmin");

        wh.MapGet("/",        async (SettingsService svc) =>
            Results.Ok(await svc.GetWarehousesAsync()));

        wh.MapPost("/",       async (CreateWarehouseRequest req, SettingsService svc) =>
        {
            var result = await svc.CreateWarehouseAsync(req);
            return Results.Created($"/api/settings/warehouses/{result.Id}", result);
        });

        wh.MapPut("/{id:guid}", async (Guid id, UpdateWarehouseRequest req, SettingsService svc) =>
        {
            var (ok, error) = await svc.UpdateWarehouseAsync(id, req);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        });

        // ── Job Type Configs (admin only) ─────────────────────────────────────
        var jtc = app.MapGroup("/api/settings/job-type-configs").WithTags("Settings")
            .RequireAuthorization("RequireAdmin");

        jtc.MapGet("/",          async (SettingsService svc) =>
            Results.Ok(await svc.GetJobTypeConfigsAsync()));

        jtc.MapPut("/{id:guid}", async (Guid id, UpdateJobTypeConfigRequest req, SettingsService svc) =>
        {
            var (ok, error) = await svc.UpdateJobTypeConfigAsync(id, req);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        });

        // ── Users (admin only) ────────────────────────────────────────────────
        var users = app.MapGroup("/api/settings/users").WithTags("Settings")
            .RequireAuthorization("RequireAdmin");

        users.MapGet("/",          async (SettingsService svc) =>
            Results.Ok(await svc.GetUsersAsync()));

        users.MapPost("/",         async (CreateUserRequest req, SettingsService svc) =>
        {
            var (ok, error, result) = await svc.CreateUserAsync(req);
            return ok ? Results.Created($"/api/settings/users/{result!.Id}", result)
                      : Results.BadRequest(new { error });
        });

        users.MapPut("/{id:guid}", async (Guid id, UpdateUserRequest req, SettingsService svc) =>
        {
            var (ok, error) = await svc.UpdateUserAsync(id, req);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        });

        // Change own password (any authenticated user)
        app.MapPost("/api/settings/users/change-password",
            async (ChangePasswordRequest req, SettingsService svc, ClaimsPrincipal user) =>
            {
                var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var (ok, error) = await svc.ChangePasswordAsync(userId, req);
                return ok ? Results.Ok() : Results.BadRequest(new { error });
            })
            .RequireAuthorization()
            .WithTags("Settings");

        return app;
    }
}
