using System.Security.Claims;
using NLC.Application.DTOs.Planning;
using NLC.Infrastructure.Services;

namespace NLC.API.Endpoints;

public static class PlanningEndpoints
{
    public static IEndpointRouteBuilder MapPlanningEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/planning").WithTags("Planning").RequireAuthorization();

        // GET /api/planning?warehouseId=&from=&to=
        group.MapGet("/", async (
            PlanningService svc, ClaimsPrincipal user,
            Guid? warehouseId, DateOnly? from, DateOnly? to) =>
        {
            var isAdmin = user.IsInRole("admin");
            var warehousesClaim = user.FindFirst("warehouses")?.Value ?? "";
            var userWarehouses = warehousesClaim.Length > 0
                ? warehousesClaim.Split(',').Select(Guid.Parse).ToArray()
                : Array.Empty<Guid>();

            var slots = await svc.GetSlotsAsync(warehouseId, from, to, userWarehouses, isAdmin);
            return Results.Ok(slots);
        });

        // POST /api/planning
        group.MapPost("/", async (CreatePlanningSlotRequest req, PlanningService svc) =>
        {
            var result = await svc.CreateAsync(req);
            return Results.Created($"/api/planning/{result.Id}", result);
        })
        .RequireAuthorization("RequireSupervisor");

        // PUT /api/planning/:id
        group.MapPut("/{id:guid}", async (Guid id, UpdatePlanningSlotRequest req, PlanningService svc) =>
        {
            var (ok, error) = await svc.UpdateAsync(id, req);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        // DELETE /api/planning/:id
        group.MapDelete("/{id:guid}", async (Guid id, PlanningService svc) =>
        {
            var (ok, error) = await svc.DeleteAsync(id);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        return app;
    }
}
