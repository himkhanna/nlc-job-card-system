using NLC.Application.DTOs.Workers;
using NLC.Infrastructure.Services;

namespace NLC.API.Endpoints;

public static class WorkerEndpoints
{
    public static IEndpointRouteBuilder MapWorkerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workers").WithTags("Workers").RequireAuthorization();

        // GET /api/workers
        group.MapGet("/", async (WorkerService svc, Guid? warehouseId, bool? isActive) =>
            Results.Ok(await svc.GetListAsync(warehouseId, isActive)));

        // GET /api/workers/:id
        group.MapGet("/{id:guid}", async (Guid id, WorkerService svc) =>
        {
            var w = await svc.GetDetailAsync(id);
            return w is null ? Results.NotFound() : Results.Ok(w);
        });

        // POST /api/workers
        group.MapPost("/", async (CreateWorkerRequest req, WorkerService svc) =>
        {
            var result = await svc.CreateAsync(req);
            return Results.Created($"/api/workers/{result.Id}", result);
        })
        .RequireAuthorization("RequireSupervisor");

        // PUT /api/workers/:id
        group.MapPut("/{id:guid}", async (Guid id, UpdateWorkerRequest req, WorkerService svc) =>
        {
            var (ok, error) = await svc.UpdateAsync(id, req);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        })
        .RequireAuthorization("RequireSupervisor");

        return app;
    }
}
