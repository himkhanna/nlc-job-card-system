using Microsoft.EntityFrameworkCore;
using NLC.Application.DTOs.Planning;
using NLC.Core.Entities;
using NLC.Core.Enums;
using NLC.Infrastructure.Data;

namespace NLC.Infrastructure.Services;

public class PlanningService(NlcDbContext db)
{
    public async Task<List<PlanningSlotDto>> GetSlotsAsync(
        Guid? warehouseId, DateOnly? from, DateOnly? to, Guid[] userWarehouseIds, bool isAdmin)
    {
        var q = db.PlanningSlots.Include(p => p.Warehouse).AsQueryable();

        if (!isAdmin && userWarehouseIds.Length > 0)
            q = q.Where(p => userWarehouseIds.Contains(p.WarehouseId));

        if (warehouseId.HasValue) q = q.Where(p => p.WarehouseId == warehouseId);
        if (from.HasValue)        q = q.Where(p => p.SlotDate >= from);
        if (to.HasValue)          q = q.Where(p => p.SlotDate <= to);

        return await q
            .OrderBy(p => p.SlotDate).ThenBy(p => p.SlotTime)
            .Select(p => new PlanningSlotDto(
                p.Id, p.WarehouseId, p.Warehouse.Name,
                p.SlotDate, p.SlotTime, p.JobType,
                p.ShipmentDescription, p.ContainerNumber,
                p.AsnNumber, p.CustomerName, p.DriverName,
                p.Status, p.ErpReference))
            .ToListAsync();
    }

    public async Task<PlanningSlotDto> CreateAsync(CreatePlanningSlotRequest req)
    {
        var slot = new PlanningSlot
        {
            WarehouseId         = req.WarehouseId,
            SlotDate            = req.SlotDate,
            SlotTime            = req.SlotTime,
            JobType             = req.JobType,
            ShipmentDescription = req.ShipmentDescription,
            ContainerNumber     = req.ContainerNumber,
            AsnNumber           = req.AsnNumber,
            CustomerName        = req.CustomerName,
            DriverName          = req.DriverName,
            Status              = PlanningSlotStatus.PLANNED,
            ErpReference        = req.ErpReference,
        };
        db.PlanningSlots.Add(slot);
        await db.SaveChangesAsync();

        var wh = await db.Warehouses.FindAsync(slot.WarehouseId);
        return new PlanningSlotDto(
            slot.Id, slot.WarehouseId, wh!.Name,
            slot.SlotDate, slot.SlotTime, slot.JobType,
            slot.ShipmentDescription, slot.ContainerNumber,
            slot.AsnNumber, slot.CustomerName, slot.DriverName,
            slot.Status, slot.ErpReference);
    }

    public async Task<(bool ok, string error)> UpdateAsync(Guid id, UpdatePlanningSlotRequest req)
    {
        var slot = await db.PlanningSlots.FindAsync(id);
        if (slot is null) return (false, "Planning slot not found");

        slot.SlotDate            = req.SlotDate;
        slot.SlotTime            = req.SlotTime;
        slot.ShipmentDescription = req.ShipmentDescription;
        slot.ContainerNumber     = req.ContainerNumber;
        slot.AsnNumber           = req.AsnNumber;
        slot.CustomerName        = req.CustomerName;
        slot.DriverName          = req.DriverName;
        slot.Status              = req.Status;
        slot.ErpReference        = req.ErpReference;

        await db.SaveChangesAsync();
        return (true, string.Empty);
    }

    public async Task<(bool ok, string error)> DeleteAsync(Guid id)
    {
        var slot = await db.PlanningSlots.FindAsync(id);
        if (slot is null) return (false, "Planning slot not found");
        db.PlanningSlots.Remove(slot);
        await db.SaveChangesAsync();
        return (true, string.Empty);
    }
}
