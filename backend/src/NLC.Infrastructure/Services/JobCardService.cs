using Microsoft.EntityFrameworkCore;
using NLC.Application.DTOs.Jobs;
using NLC.Core.Entities;
using NLC.Core.Enums;
using NLC.Infrastructure.Data;

namespace NLC.Infrastructure.Services;

public class JobCardService(NlcDbContext db)
{
    // ── List ─────────────────────────────────────────────────────────────────
    public async Task<List<JobCardListDto>> GetListAsync(
        Guid? warehouseId, JobStatus? status, JobType? type, Priority? priority,
        string? search, Guid[] userWarehouseIds, bool isAdmin)
    {
        var q = db.JobCards
            .Include(j => j.Warehouse)
            .AsQueryable();

        if (!isAdmin && userWarehouseIds.Length > 0)
            q = q.Where(j => userWarehouseIds.Contains(j.WarehouseId));

        if (warehouseId.HasValue) q = q.Where(j => j.WarehouseId == warehouseId);
        if (status.HasValue)      q = q.Where(j => j.Status == status);
        if (type.HasValue)        q = q.Where(j => j.JobType == type);
        if (priority.HasValue)    q = q.Where(j => j.Priority == priority);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(j =>
                j.JobNumber.ToLower().Contains(s) ||
                j.CustomerName.ToLower().Contains(s) ||
                (j.ContainerNumber != null && j.ContainerNumber.ToLower().Contains(s)) ||
                (j.AsnNumber       != null && j.AsnNumber.ToLower().Contains(s))       ||
                (j.OrderNumber     != null && j.OrderNumber.ToLower().Contains(s)));
        }

        return await q
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new JobCardListDto(
                j.Id, j.JobNumber, j.Warehouse.Name,
                j.JobType, j.Status, j.CustomerName,
                j.ContainerNumber, j.AsnNumber, j.OrderNumber,
                j.CurrentPhase, j.ProgressPercent, j.Priority,
                j.GrnGenerated, j.ErpSynced, j.CreatedAt, j.CompletedAt))
            .ToListAsync();
    }

    // ── Detail ────────────────────────────────────────────────────────────────
    public async Task<JobCardDetailDto?> GetDetailAsync(Guid id)
    {
        var j = await db.JobCards
            .Include(x => x.Warehouse)
            .Include(x => x.JobTypeConfig)
            .Include(x => x.PhaseLogs)
            .Include(x => x.ClockEvents).ThenInclude(c => c.Worker)
            .Include(x => x.SkuTallies)
            .Include(x => x.DispatchNotes).ThenInclude(d => d.SkuLines)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (j is null) return null;

        return new JobCardDetailDto(
            j.Id, j.JobNumber, j.WarehouseId, j.Warehouse.Name,
            j.JobType, j.JobTypeConfig.Name, j.PhasesSnapshot,
            j.Status, j.CustomerName, j.ContainerNumber,
            j.AsnNumber, j.OrderNumber, j.CurrentPhase,
            j.ProgressPercent, j.Priority, j.GrnGenerated, j.ErpSynced,
            j.ReactivationReason, j.ReactivatedBy, j.ReactivatedAt,
            j.Notes, j.CreatedAt, j.CompletedAt,
            j.PhaseLogs.Select(p => new PhaseLogDto(p.Id, p.PhaseName, p.PhaseStatus, p.IsOptional, p.StartedAt, p.CompletedAt, p.Notes)).ToList(),
            j.ClockEvents.OrderBy(c => c.ClockInTime).Select(c => new ClockEventDto(c.Id, c.WorkerId, c.Worker.Name, c.PhaseName, c.ClockInTime, c.ClockOutTime, c.DurationMinutes)).ToList(),
            j.SkuTallies.Select(s => new SkuTallyDto(s.Id, s.SkuCode, s.SkuDescription, s.ExpectedQty, s.ScannedQty, s.TimeSpentMinutes, s.TallyStatus, s.Source.ToString())).ToList(),
            j.DispatchNotes.Select(d => new DispatchNoteDto(d.Id, d.DnNumber, d.CustomerName, d.DispatchStatus, d.CreatedAt, d.DispatchedAt,
                d.SkuLines.Select(l => new DispatchSkuLineDto(l.Id, l.SkuCode, l.SkuDescription, l.OrderedQty, l.PickedQty, l.DispatchedQty, l.VarianceQty, l.VarianceApproved, l.ApprovedBy)).ToList()
            )).ToList()
        );
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public async Task<JobCardDetailDto> CreateAsync(CreateJobCardRequest req, Guid createdBy)
    {
        var config = await db.JobTypeConfigs
            .Where(c => c.Name == req.JobType.ToString() && c.IsActive)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"No active config for {req.JobType}");

        var year     = DateTime.UtcNow.Year;
        var count    = await db.JobCards.CountAsync(j => j.CreatedAt.Year == year);
        var jobNumber = $"JC-{year}-{(count + 1):D4}";

        var job = new JobCard
        {
            JobNumber       = jobNumber,
            WarehouseId     = req.WarehouseId,
            JobType         = req.JobType,
            JobTypeConfigId = config.Id,
            PhasesSnapshot  = config.Phases,
            Status          = JobStatus.PLANNED,
            CustomerName    = req.CustomerName,
            ContainerNumber = req.ContainerNumber,
            AsnNumber       = req.AsnNumber,
            OrderNumber     = req.OrderNumber,
            CurrentPhase    = config.Phases.FirstOrDefault(),
            Priority        = req.Priority,
            Notes           = req.Notes,
            CreatedBy       = createdBy,
        };

        // Create phase logs
        foreach (var phase in config.Phases)
        {
            job.PhaseLogs.Add(new JobPhaseLog
            {
                PhaseName   = phase,
                PhaseStatus = PhaseStatus.PENDING,
                IsOptional  = phase == "VAS" && config.VasOptional,
            });
        }

        db.JobCards.Add(job);
        await db.SaveChangesAsync();
        return (await GetDetailAsync(job.Id))!;
    }

    // ── Complete phase ────────────────────────────────────────────────────────
    public async Task<(bool ok, string error)> CompletePhaseAsync(Guid jobId, CompletePhaseRequest req, Guid userId)
    {
        var job = await db.JobCards
            .Include(j => j.PhaseLogs)
            .Include(j => j.ClockEvents)
            .Include(j => j.JobTypeConfig)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job is null) return (false, "Job not found");

        // BUSINESS RULE 4: Hard block if any worker still clocked in
        var openClock = job.ClockEvents.Any(c => c.PhaseName == req.PhaseName && c.ClockOutTime is null);
        if (openClock) return (false, "Cannot complete phase — workers are still clocked in. Clock out all workers first.");

        var phaseLog = job.PhaseLogs.FirstOrDefault(p => p.PhaseName == req.PhaseName);
        if (phaseLog is null) return (false, "Phase not found on this job");
        if (phaseLog.PhaseStatus == PhaseStatus.COMPLETED) return (false, "Phase already completed");

        phaseLog.PhaseStatus = PhaseStatus.COMPLETED;
        phaseLog.CompletedAt = DateTime.UtcNow;
        phaseLog.CompletedBy = userId;
        phaseLog.Notes       = req.Notes;

        // Advance to next phase
        var phases     = job.PhasesSnapshot;
        var currentIdx = Array.IndexOf(phases, req.PhaseName);
        var nextPhase  = currentIdx < phases.Length - 1 ? phases[currentIdx + 1] : null;

        job.CurrentPhase    = nextPhase ?? req.PhaseName;
        job.ProgressPercent = (int)((currentIdx + 1.0) / phases.Length * 100);

        // Mark job as complete if last phase
        if (nextPhase is null || req.PhaseName == "Complete")
        {
            job.Status      = JobStatus.COMPLETED;
            job.CompletedAt = DateTime.UtcNow;
        }
        else
        {
            job.Status = JobStatus.IN_PROGRESS;
            // Start next phase log
            var nextLog = job.PhaseLogs.FirstOrDefault(p => p.PhaseName == nextPhase);
            if (nextLog is not null)
            {
                nextLog.PhaseStatus = PhaseStatus.IN_PROGRESS;
                nextLog.StartedAt   = DateTime.UtcNow;
            }
        }

        // BUSINESS RULE 2: GRN triggers on Putaway completion only
        if (req.PhaseName == job.JobTypeConfig?.GrnTriggerPhase)
        {
            job.GrnGenerated = true;
            // Hangfire job would be dispatched here in production
        }

        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    // ── Skip phase (VAS) ──────────────────────────────────────────────────────
    public async Task<(bool ok, string error)> SkipPhaseAsync(Guid jobId, SkipPhaseRequest req)
    {
        var job = await db.JobCards
            .Include(j => j.PhaseLogs)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job is null) return (false, "Job not found");

        var phaseLog = job.PhaseLogs.FirstOrDefault(p => p.PhaseName == req.PhaseName);
        if (phaseLog is null)          return (false, "Phase not found");
        if (!phaseLog.IsOptional)      return (false, "Only optional phases can be skipped");
        if (phaseLog.PhaseStatus == PhaseStatus.COMPLETED) return (false, "Phase already completed");

        phaseLog.PhaseStatus = PhaseStatus.SKIPPED;
        phaseLog.Notes       = req.Reason;

        // Advance current phase
        var phases     = job.PhasesSnapshot;
        var currentIdx = Array.IndexOf(phases, req.PhaseName);
        var next       = currentIdx < phases.Length - 1 ? phases[currentIdx + 1] : null;
        if (next is not null) job.CurrentPhase = next;

        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    // ── Reactivate ────────────────────────────────────────────────────────────
    public async Task<(bool ok, string error)> ReactivateAsync(Guid jobId, ReactivateJobRequest req)
    {
        var job = await db.JobCards.FindAsync(jobId);
        if (job is null)                       return (false, "Job not found");
        if (job.Status != JobStatus.COMPLETED) return (false, "Only completed jobs can be reactivated");

        job.Status             = JobStatus.REACTIVATED;
        job.ReactivationReason = req.Reason;
        job.ReactivatedBy      = req.ReactivatedBy;
        job.ReactivatedAt      = DateTime.UtcNow;
        job.CompletedAt        = null;

        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    // ── Clock in ──────────────────────────────────────────────────────────────
    public async Task<(bool ok, string error, ClockEventDto? result)> ClockInAsync(Guid jobId, ClockInRequest req, Guid recordedBy)
    {
        // BUSINESS RULE 7: No double clock-in
        var openEvent = await db.ClockEvents
            .Include(c => c.JobCard)
            .FirstOrDefaultAsync(c => c.WorkerId == req.WorkerId && c.ClockOutTime == null);

        if (openEvent is not null)
            return (false, $"Worker already clocked in on {openEvent.JobCard.JobNumber}. Clock out first.", null);

        // BUSINESS RULE 5: Tally phase — specialist only
        if (req.PhaseName == "Tally")
        {
            var worker = await db.Workers.FindAsync(req.WorkerId);
            if (worker is null || !worker.Skills.Contains("Tally"))
                return (false, "Only workers with Tally skill can be assigned to the Tally phase.", null);
        }

        var clockEvent = new ClockEvent
        {
            JobId       = jobId,
            WorkerId    = req.WorkerId,
            PhaseName   = req.PhaseName,
            ClockInTime = DateTime.UtcNow,
            RecordedBy  = recordedBy,
            Notes       = req.Notes,
        };

        db.ClockEvents.Add(clockEvent);

        // Set job to IN_PROGRESS if PLANNED
        var job = await db.JobCards.FindAsync(jobId);
        if (job?.Status == JobStatus.PLANNED)
        {
            job.Status = JobStatus.IN_PROGRESS;
            // Set phase log to IN_PROGRESS
            var phaseLog = await db.JobPhaseLogs.FirstOrDefaultAsync(p => p.JobId == jobId && p.PhaseName == req.PhaseName);
            if (phaseLog is not null && phaseLog.PhaseStatus == PhaseStatus.PENDING)
            {
                phaseLog.PhaseStatus = PhaseStatus.IN_PROGRESS;
                phaseLog.StartedAt   = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync();

        var worker2 = await db.Workers.FindAsync(req.WorkerId);
        var dto = new ClockEventDto(clockEvent.Id, clockEvent.WorkerId, worker2!.Name, clockEvent.PhaseName, clockEvent.ClockInTime, null, null);
        return (true, string.Empty, dto);
    }

    // ── Clock out ─────────────────────────────────────────────────────────────
    public async Task<(bool ok, string error)> ClockOutAsync(Guid jobId, ClockOutRequest req)
    {
        var clockEvent = await db.ClockEvents
            .FirstOrDefaultAsync(c => c.Id == req.ClockEventId && c.JobId == jobId);

        if (clockEvent is null)          return (false, "Clock event not found");
        if (clockEvent.ClockOutTime.HasValue) return (false, "Already clocked out");

        clockEvent.ClockOutTime    = DateTime.UtcNow;
        clockEvent.DurationMinutes = (int)(clockEvent.ClockOutTime.Value - clockEvent.ClockInTime).TotalMinutes;
        if (req.Notes is not null) clockEvent.Notes = req.Notes;

        await db.SaveChangesAsync();
        return (true, string.Empty);
    }
}
