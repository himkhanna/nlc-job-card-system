package com.nlc.domain.enums;

public final class Enums {
    private Enums() {}

    public enum JobStatus        { PLANNED, IN_PROGRESS, COMPLETED, REACTIVATED }
    public enum JobType          { INBOUND, OUTBOUND }
    public enum Priority         { NORMAL, HIGH, URGENT }
    public enum PhaseStatus      { PENDING, IN_PROGRESS, COMPLETED, SKIPPED }
    public enum WorkerType       { PERMANENT, CONTRACT, AD_HOC }
    public enum DispatchStatus   { PENDING, TALLIED, LOADED, DISPATCHED }
    public enum ErpSyncType      { PULL, PUSH }
    public enum ErpSyncStatus    { SUCCESS, FAILED, PENDING }
    public enum PlanningSlotStatus { PLANNED, CONFIRMED, ARRIVED, JOB_CREATED }
    public enum TallyStatus      { PENDING, PARTIAL, COMPLETE }
    public enum TallySource      { MANUAL, ERP_SYNC }
    public enum UserRole         { admin, supervisor, tally_user, viewer }
}
