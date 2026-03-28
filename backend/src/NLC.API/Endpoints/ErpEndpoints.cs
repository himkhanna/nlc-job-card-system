using Microsoft.EntityFrameworkCore;
using NLC.Core.Entities;
using NLC.Core.Enums;
using NLC.Infrastructure.Data;
using NLC.Infrastructure.Services;

namespace NLC.API.Endpoints;

public static class ErpEndpoints
{
    public static IEndpointRouteBuilder MapErpEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/erp").WithTags("ERP").RequireAuthorization();

        // GET /api/erp/planning — mock ERP planning slots
        group.MapGet("/planning", async () =>
        {
            await Task.Delay(1500); // simulate latency
            return Results.Ok(new
            {
                source = "ERP_STUB",
                slots = new[]
                {
                    new { containerNumber = "TCKU9999001", asnNumber = "ASN-20001", customerName = "DHL UAE", jobType = "INBOUND", expectedArrival = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ") },
                    new { containerNumber = "MSCU8888002", asnNumber = "ASN-20002", customerName = "Aramex", jobType = "INBOUND", expectedArrival = DateTime.UtcNow.AddDays(2).ToString("yyyy-MM-ddTHH:mm:ssZ") },
                }
            });
        });

        // GET /api/erp/tally/:jobId — mock tally data
        group.MapGet("/tally/{jobId:guid}", async (Guid jobId) =>
        {
            await Task.Delay(1500);
            return Results.Ok(new
            {
                source = "ERP_STUB",
                jobId,
                lines = new[]
                {
                    new { skuCode = "SKU-99001", skuDescription = "Mock SKU Item A", expectedQty = 50 },
                    new { skuCode = "SKU-99002", skuDescription = "Mock SKU Item B", expectedQty = 30 },
                }
            });
        });

        // POST /api/erp/push/:jobId — simulate ERP push
        group.MapPost("/push/{jobId:guid}", async (Guid jobId, NlcDbContext db) =>
        {
            await Task.Delay(1500);
            var log = new ErpSyncLog
            {
                JobId          = jobId,
                SyncType       = ErpSyncType.PUSH,
                PayloadSummary = $"Phase completion push for job {jobId}",
                Status         = ErpSyncStatus.SUCCESS,
                SyncedAt       = DateTime.UtcNow,
            };
            db.ErpSyncLogs.Add(log);

            var job = await db.JobCards.FindAsync(jobId);
            if (job is not null) job.ErpSynced = true;

            await db.SaveChangesAsync();
            return Results.Ok(new { message = "ERP push simulated successfully", logId = log.Id });
        });

        // POST /api/webhook/tally-complete/:jobId — ERP webhook triggers Tally auto-complete
        app.MapPost("/api/webhook/tally-complete/{jobId:guid}",
            async (Guid jobId, JobCardService svc) =>
            {
                var req = new NLC.Application.DTOs.Jobs.CompletePhaseRequest("Tally", "Auto-completed by ERP VR-GRN signal");
                var (ok, error) = await svc.CompletePhaseAsync(jobId, req, Guid.Empty);
                return ok
                    ? Results.Ok(new { message = "Tally phase auto-completed via ERP signal" })
                    : Results.BadRequest(new { error });
            })
            .AllowAnonymous() // webhook — auth via secret header in production
            .WithTags("ERP");

        return app;
    }
}
