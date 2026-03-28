using System.Security.Claims;
using NLC.Application.DTOs.Jobs;
using NLC.Infrastructure.Services;
using NLC.Core.Enums;

namespace NLC.API.Endpoints;

public static class JobEndpoints
{
    public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/jobs").WithTags("Jobs").RequireAuthorization();

        // GET /api/jobs
        group.MapGet("/", async (
            JobCardService svc, ClaimsPrincipal user,
            Guid? warehouseId, string? status, string? type, string? priority, string? search) =>
        {
            var isAdmin    = user.IsInRole("admin");
            var warehousesClaim = user.FindFirst("warehouses")?.Value ?? "";
            var userWarehouses  = warehousesClaim.Length > 0
                ? warehousesClaim.Split(',').Select(Guid.Parse).ToArray()
                : Array.Empty<Guid>();

            var statusEnum   = Enum.TryParse<JobStatus>(status,   true, out var s)   ? s   : (JobStatus?)null;
            var typeEnum     = Enum.TryParse<JobType>(type,       true, out var t)   ? t   : (JobType?)null;
            var priorityEnum = Enum.TryParse<Priority>(priority,  true, out var p)   ? p   : (Priority?)null;

            var jobs = await svc.GetListAsync(warehouseId, statusEnum, typeEnum, priorityEnum, search, userWarehouses, isAdmin);
            return Results.Ok(jobs);
        });

        // GET /api/jobs/:id
        group.MapGet("/{id:guid}", async (Guid id, JobCardService svc) =>
        {
            var job = await svc.GetDetailAsync(id);
            return job is null ? Results.NotFound() : Results.Ok(job);
        });

        // POST /api/jobs
        group.MapPost("/", async (CreateJobCardRequest req, JobCardService svc, ClaimsPrincipal user) =>
        {
            var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            var result = await svc.CreateAsync(req, userId);
            return Results.Created($"/api/jobs/{result.Id}", result);
        })
        .RequireAuthorization("RequireSupervisor");

        // POST /api/jobs/:id/complete-phase
        group.MapPost("/{id:guid}/complete-phase", async (Guid id, CompletePhaseRequest req, JobCardService svc, ClaimsPrincipal user) =>
        {
            var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            var (ok, error) = await svc.CompletePhaseAsync(id, req, userId);
            return ok ? Results.Ok() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        // POST /api/jobs/:id/skip-phase
        group.MapPost("/{id:guid}/skip-phase", async (Guid id, SkipPhaseRequest req, JobCardService svc) =>
        {
            var (ok, error) = await svc.SkipPhaseAsync(id, req);
            return ok ? Results.Ok() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        // POST /api/jobs/:id/reactivate
        group.MapPost("/{id:guid}/reactivate", async (Guid id, ReactivateJobRequest req, JobCardService svc) =>
        {
            var (ok, error) = await svc.ReactivateAsync(id, req);
            return ok ? Results.Ok() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        // POST /api/jobs/:id/clock-in
        group.MapPost("/{id:guid}/clock-in", async (Guid id, ClockInRequest req, JobCardService svc, ClaimsPrincipal user) =>
        {
            var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            var (ok, error, result) = await svc.ClockInAsync(id, req, userId);
            return ok ? Results.Ok(result) : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        // POST /api/jobs/:id/clock-out
        group.MapPost("/{id:guid}/clock-out", async (Guid id, ClockOutRequest req, JobCardService svc) =>
        {
            var (ok, error) = await svc.ClockOutAsync(id, req);
            return ok ? Results.Ok() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        return app;
    }
}
