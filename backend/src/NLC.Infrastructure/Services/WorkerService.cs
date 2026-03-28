using Microsoft.EntityFrameworkCore;
using NLC.Application.DTOs.Workers;
using NLC.Core.Entities;
using NLC.Infrastructure.Data;

namespace NLC.Infrastructure.Services;

public class WorkerService(NlcDbContext db)
{
    public async Task<List<WorkerListDto>> GetListAsync(Guid? warehouseId, bool? isActive)
    {
        var q = db.Workers.AsQueryable();

        if (isActive.HasValue) q = q.Where(w => w.IsActive == isActive);

        if (warehouseId.HasValue)
            q = q.Where(w => w.AssignedWarehouseIds.Contains(warehouseId.Value));

        var workers = await q.OrderBy(w => w.Name).ToListAsync();

        // Get open clock events for all workers in one query
        var workerIds    = workers.Select(w => w.Id).ToList();
        var openClocks   = await db.ClockEvents
            .Include(c => c.JobCard)
            .Where(c => workerIds.Contains(c.WorkerId) && c.ClockOutTime == null)
            .ToListAsync();

        var clockMap = openClocks.ToDictionary(c => c.WorkerId);

        return workers.Select(w =>
        {
            clockMap.TryGetValue(w.Id, out var clock);
            return new WorkerListDto(
                w.Id, w.Name, w.EmployeeId, w.WorkerType, w.Skills,
                w.Role, w.IsActive,
                clock is not null, clock?.JobCard.JobNumber, clock?.PhaseName);
        }).ToList();
    }

    public async Task<WorkerDetailDto?> GetDetailAsync(Guid id)
    {
        var w = await db.Workers.FindAsync(id);
        if (w is null) return null;

        var recentClocks = await db.ClockEvents
            .Include(c => c.JobCard)
            .Where(c => c.WorkerId == id)
            .OrderByDescending(c => c.ClockInTime)
            .Take(20)
            .Select(c => new WorkerClockSummaryDto(
                c.Id, c.JobCard.JobNumber, c.PhaseName,
                c.ClockInTime, c.ClockOutTime, c.DurationMinutes))
            .ToListAsync();

        return new WorkerDetailDto(
            w.Id, w.Name, w.EmployeeId, w.WorkerType, w.Skills,
            w.Role, w.AssignedWarehouseIds, w.IsActive, w.ErpId,
            recentClocks);
    }

    public async Task<WorkerDetailDto> CreateAsync(CreateWorkerRequest req)
    {
        var worker = new Worker
        {
            Name                = req.Name,
            EmployeeId          = req.EmployeeId,
            WorkerType          = req.WorkerType,
            Skills              = req.Skills,
            Role                = req.Role,
            AssignedWarehouseIds = req.AssignedWarehouseIds,
            ErpId               = req.ErpId,
            IsActive            = true,
        };
        db.Workers.Add(worker);
        await db.SaveChangesAsync();
        return (await GetDetailAsync(worker.Id))!;
    }

    public async Task<(bool ok, string error)> UpdateAsync(Guid id, UpdateWorkerRequest req)
    {
        var worker = await db.Workers.FindAsync(id);
        if (worker is null) return (false, "Worker not found");

        worker.Name                = req.Name;
        worker.WorkerType          = req.WorkerType;
        worker.Skills              = req.Skills;
        worker.Role                = req.Role;
        worker.AssignedWarehouseIds = req.AssignedWarehouseIds;
        worker.IsActive            = req.IsActive;
        worker.ErpId               = req.ErpId;

        await db.SaveChangesAsync();
        return (true, string.Empty);
    }
}
