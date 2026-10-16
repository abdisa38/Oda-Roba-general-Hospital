import { useState } from "react"
import Icon from "../Icon"
import {
  type WorkflowStage,
  OUTPATIENT_WORKFLOW_STAGES,
  INPATIENT_WORKFLOW_STAGES,
} from "./model"

interface CrossModuleWorkflowProps {
  currentStageId?: string
  onNavigateStage?: (destinationId: string) => void
}

export default function CrossModuleWorkflow({
  currentStageId = "stage-consult",
  onNavigateStage,
}: CrossModuleWorkflowProps) {
  const [flowType, setFlowType] = useState<"outpatient" | "inpatient">("outpatient")

  const stages: WorkflowStage[] =
    flowType === "outpatient" ? OUTPATIENT_WORKFLOW_STAGES : INPATIENT_WORKFLOW_STAGES

  return (
    <section className="orh-workflow-stepper" aria-label="Cross-Module Patient Care Journey">
      <div className="orh-workflow-title-bar">
        <div>
          <strong style={{ fontSize: "0.95rem", color: "var(--orh-navy)" }}>
            Cross-Module Patient Care Journey
          </strong>
          <span style={{ fontSize: "0.8rem", color: "var(--orh-text-muted)", marginLeft: "0.5rem" }}>
            (Connected Clinical, Diagnostic, Pharmacy & Financial Sequence)
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            className={`portal-btn portal-btn-sm ${flowType === "outpatient" ? "portal-btn-primary" : "portal-btn-secondary"}`}
            onClick={() => setFlowType("outpatient")}
          >
            Outpatient Care Flow
          </button>
          <button
            type="button"
            className={`portal-btn portal-btn-sm ${flowType === "inpatient" ? "portal-btn-primary" : "portal-btn-secondary"}`}
            onClick={() => setFlowType("inpatient")}
          >
            Emergency & Inpatient Flow
          </button>
        </div>
      </div>

      <div className="orh-workflow-stages">
        {stages.map((stage) => {
          const isCurrent = stage.id === currentStageId
          return (
            <div
              key={stage.id}
              className={`orh-workflow-card ${
                stage.status === "completed"
                  ? "completed"
                  : isCurrent
                  ? "current"
                  : ""
              }`}
              onClick={() => onNavigateStage && onNavigateStage(stage.destinationId)}
              title={`Click to open ${stage.module}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  if (onNavigateStage) onNavigateStage(stage.destinationId)
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="orh-workflow-step-num">Stage {stage.stageNumber}</span>
                {stage.status === "completed" ? (
                  <span className="orh-status-badge success" style={{ padding: "0.1rem 0.35rem", fontSize: "0.68rem" }}>
                    <Icon name="check" size={11} /> Done
                  </span>
                ) : isCurrent ? (
                  <span className="orh-status-badge progress" style={{ padding: "0.1rem 0.35rem", fontSize: "0.68rem" }}>
                    <Icon name="activity" size={11} /> Active
                  </span>
                ) : (
                  <span className="orh-status-badge neutral" style={{ padding: "0.1rem 0.35rem", fontSize: "0.68rem" }}>
                    Pending
                  </span>
                )}
              </div>

              <div className="orh-workflow-card-title">{stage.title}</div>
              <div className="orh-workflow-card-meta">{stage.description}</div>

              <div style={{ borderTop: "1px solid var(--orh-border-light)", paddingTop: "0.35rem", fontSize: "0.72rem", color: "var(--orh-navy)" }}>
                <strong>Role:</strong> {stage.actorRole}
              </div>

              {stage.recordReference && (
                <div style={{ fontSize: "0.72rem", color: "var(--orh-text-muted)", fontFamily: "monospace" }}>
                  Ref: {stage.recordReference}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
