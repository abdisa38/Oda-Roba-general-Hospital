// ORHIMS — Phase 08: Hospital Billing & Financial Management Module
// Oda Roba General Hospital — Finance & Cashier Office (Bale Robe, Ethiopia)

import React, { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button } from "../permissions/ui"
import {
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  PAYMENT_METHODS,
  SERVICE_CATEGORIES,
  STANDARD_TARIFFS,
  formatETB,
  type BillableItem,
  type Invoice,
  type InvoiceStatus,
  type PaymentMethod,
  type PaymentReceipt,
  type ServiceCategory,
} from "./model"
import "./hospital-billing.css"

interface HospitalBillingPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
  initialTab?: "overview" | "invoices" | "payments" | "payment-history" | "reports"
}

export default function HospitalBillingPage({
  state = "ready",
  permissions,
  onNavigate,
  initialTab = "overview",
}: HospitalBillingPageProps) {
  // Authorization check
  const isAuthorized =
    permissions.has("cashier") ||
    permissions.has("invoices") ||
    permissions.has("payments") ||
    permissions.has("payment-history") ||
    permissions.has("billing-overview") ||
    permissions.has("financial-reports") ||
    permissions.has("management")

  // Active sub-view tab
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "payments" | "payment-history" | "reports">(
    initialTab
  )

  // Master Data State
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
  const [payments, setPayments] = useState<PaymentReceipt[]>(INITIAL_PAYMENTS)

  // Selected Items for Drawers & Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null)

  // Modals
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false)
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [printableReceiptOpen, setPrintableReceiptOpen] = useState<PaymentReceipt | null>(null)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // ── Search & Filter State for Invoices ──
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("All Statuses")
  const [invoiceDeptFilter, setInvoiceDeptFilter] = useState<string>("All Departments")
  const [invoicePage, setInvoicePage] = useState(1)
  const pageSize = 8

  // ── Search & Filter State for Payments ──
  const [paymentSearch, setPaymentSearch] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("All Methods")
  const [paymentPage, setPaymentPage] = useState(1)

  // ── Report Filter State ──
  const [reportPeriod, setReportPeriod] = useState<"today" | "7days" | "month">("month")

  // ── Financial Metric Calculations ──
  const todayInvoiced = useMemo(() => {
    return invoices
      .filter((inv) => inv.issueDate.includes("16 Oct 2026"))
      .reduce((sum, inv) => sum + inv.totalAmountETB, 0)
  }, [invoices])

  const todayPayments = useMemo(() => {
    return payments
      .filter((p) => p.paymentDate.includes("16 Oct 2026"))
      .reduce((sum, p) => sum + p.amountPaidETB, 0)
  }, [payments])

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.outstandingBalanceETB, 0)
  }, [invoices])

  const partiallyPaidCount = useMemo(() => {
    return invoices.filter((inv) => inv.status === "Partially Paid").length
  }, [invoices])

  const overdueCount = useMemo(() => {
    return invoices.filter((inv) => inv.status === "Overdue").length
  }, [invoices])

  const overdueAmount = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.outstandingBalanceETB, 0)
  }, [invoices])

  // ── Filtered Invoices ──
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (invoiceSearch.trim()) {
        const q = invoiceSearch.toLowerCase()
        const matchesInv = inv.id.toLowerCase().includes(q)
        const matchesPt = inv.patientName.toLowerCase().includes(q) || inv.patientId.toLowerCase().includes(q)
        const matchesEnc = inv.encounterId.toLowerCase().includes(q)
        if (!matchesInv && !matchesPt && !matchesEnc) return false
      }
      if (invoiceStatusFilter !== "All Statuses" && inv.status !== invoiceStatusFilter) return false
      if (invoiceDeptFilter !== "All Departments" && inv.department !== invoiceDeptFilter) return false
      return true
    })
  }, [invoices, invoiceSearch, invoiceStatusFilter, invoiceDeptFilter])

  const totalInvoicePages = Math.ceil(filteredInvoices.length / pageSize) || 1
  const paginatedInvoices = useMemo(() => {
    const start = (invoicePage - 1) * pageSize
    return filteredInvoices.slice(start, start + pageSize)
  }, [filteredInvoices, invoicePage, pageSize])

  // ── Filtered Payments ──
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (paymentSearch.trim()) {
        const q = paymentSearch.toLowerCase()
        const matchesRec = p.id.toLowerCase().includes(q)
        const matchesPt = p.patientName.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q)
        const matchesInv = p.invoiceId.toLowerCase().includes(q)
        const matchesTxn = p.transactionReference.toLowerCase().includes(q)
        if (!matchesRec && !matchesPt && !matchesInv && !matchesTxn) return false
      }
      if (paymentMethodFilter !== "All Methods" && p.paymentMethod !== paymentMethodFilter) return false
      return true
    })
  }, [payments, paymentSearch, paymentMethodFilter])

  const totalPaymentPages = Math.ceil(filteredPayments.length / pageSize) || 1
  const paginatedPayments = useMemo(() => {
    const start = (paymentPage - 1) * pageSize
    return filteredPayments.slice(start, start + pageSize)
  }, [filteredPayments, paymentPage, pageSize])

  // ── Create Invoice Form State ──
  const [newInvPatientName, setNewInvPatientName] = useState("Abebech Gobena")
  const [newInvPatientId, setNewInvPatientId] = useState("ORH-2026-0881")
  const [newInvPatientAge, setNewInvPatientAge] = useState(38)
  const [newInvGender, setNewInvGender] = useState<"Male" | "Female">("Female")
  const [newInvEncounter, setNewInvEncounter] = useState("ENC-2026-1052")
  const [newInvDepartment, setNewInvDepartment] = useState("Adult OPD-1")
  const [newInvNotes, setNewInvNotes] = useState("General consultation and prescribed antimicrobial medications.")
  const [newInvDiscount, setNewInvDiscount] = useState("0")

  const [newInvItems, setNewInvItems] = useState<BillableItem[]>([
    {
      id: "LINE-1",
      category: "Consultation",
      serviceName: "General Outpatient Consultation",
      unitPriceETB: 150,
      quantity: 1,
      totalETB: 150,
    },
    {
      id: "LINE-2",
      category: "Laboratory",
      serviceName: "Complete Blood Count (CBC) with Diff",
      unitPriceETB: 120,
      quantity: 1,
      totalETB: 120,
    },
  ])

  // New item selector inputs
  const [selectedTariffCode, setSelectedTariffCode] = useState(STANDARD_TARIFFS[0].code)
  const [itemQty, setItemQty] = useState("1")

  const handleAddItemToInvoice = () => {
    const tariff = STANDARD_TARIFFS.find((t) => t.code === selectedTariffCode)
    if (!tariff) return
    const qty = parseInt(itemQty) || 1
    const newItem: BillableItem = {
      id: `ITEM-${Date.now()}`,
      category: tariff.category,
      serviceName: tariff.name,
      unitPriceETB: tariff.defaultPriceETB,
      quantity: qty,
      totalETB: tariff.defaultPriceETB * qty,
    }
    setNewInvItems([...newInvItems, newItem])
    setItemQty("1")
    showToast(`Added ${tariff.name} to invoice items.`)
  }

  const handleRemoveItem = (id: string) => {
    setNewInvItems(newInvItems.filter((it) => it.id !== id))
  }

  const newInvSubtotal = useMemo(() => {
    return newInvItems.reduce((acc, it) => acc + it.totalETB, 0)
  }, [newInvItems])

  const newInvDiscountNum = parseFloat(newInvDiscount) || 0
  const newInvGrandTotal = Math.max(0, newInvSubtotal - newInvDiscountNum)

  const handleSaveInvoice = (status: "Draft" | "Issued") => {
    if (newInvItems.length === 0) {
      alert("Please add at least one billable service or item.")
      return
    }

    const newInvoice: Invoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: newInvPatientId,
      patientName: newInvPatientName,
      patientAge: newInvPatientAge,
      patientGender: newInvGender,
      encounterId: newInvEncounter,
      department: newInvDepartment,
      issueDate: "16 Oct 2026 · 11:45 AM",
      dueDate: "23 Oct 2026",
      subtotalETB: newInvSubtotal,
      discountETB: newInvDiscountNum,
      totalAmountETB: newInvGrandTotal,
      paidAmountETB: 0,
      outstandingBalanceETB: newInvGrandTotal,
      status: status,
      items: newInvItems,
      notes: newInvNotes,
      createdBy: "Billing Officer Kedir Abdi",
    }

    setInvoices([newInvoice, ...invoices])
    setCreateInvoiceOpen(false)
    showToast(`Invoice ${newInvoice.id} created (${status}). Outstanding: ${formatETB(newInvGrandTotal)}`)
  }

  // ── Record Payment Form State ──
  const [payTargetInvId, setPayTargetInvId] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Cash")
  const [payTxnRef, setPayTxnRef] = useState("CASH-DRAWER-01")
  const [payCashTendered, setPayCashTendered] = useState("")
  const [payNotes, setPayNotes] = useState("")
  const [payError, setPayError] = useState("")

  // Pre-load payment for a specific invoice
  const openPaymentForInvoice = (inv: Invoice) => {
    setPayTargetInvId(inv.id)
    setPayAmount(inv.outstandingBalanceETB.toString())
    setPayMethod("Cash")
    setPayTxnRef("CASH-DRAWER-01")
    setPayCashTendered(inv.outstandingBalanceETB.toString())
    setPayNotes(`Settlement of invoice ${inv.id}`)
    setPayError("")
    setRecordPaymentOpen(true)
  }

  // Target invoice for payment
  const activePayInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === payTargetInvId) || null
  }, [invoices, payTargetInvId])

  const payAmountNum = parseFloat(payAmount) || 0
  const cashTenderedNum = parseFloat(payCashTendered) || 0
  const changeDue = Math.max(0, cashTenderedNum - payAmountNum)
  const remainingBalanceAfterPay = activePayInvoice
    ? Math.max(0, activePayInvoice.outstandingBalanceETB - payAmountNum)
    : 0

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setPayError("")

    if (!activePayInvoice) {
      setPayError("Please select an active unpaid invoice.")
      return
    }

    if (payAmountNum <= 0) {
      setPayError("Payment amount must be greater than zero.")
      return
    }

    if (payAmountNum > activePayInvoice.outstandingBalanceETB) {
      setPayError(
        `Payment amount (${formatETB(payAmountNum)}) cannot exceed outstanding balance (${formatETB(
          activePayInvoice.outstandingBalanceETB
        )}).`
      )
      return
    }

    if (payMethod === "Cash" && cashTenderedNum < payAmountNum) {
      setPayError(`Cash tendered is less than the payment amount due.`)
      return
    }

    // Generate new receipt
    const newReceiptId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const newReceipt: PaymentReceipt = {
      id: newReceiptId,
      invoiceId: activePayInvoice.id,
      patientId: activePayInvoice.patientId,
      patientName: activePayInvoice.patientName,
      paymentDate: "16 Oct 2026 · 11:50 AM",
      amountPaidETB: payAmountNum,
      paymentMethod: payMethod,
      transactionReference: payTxnRef.trim() || `TXN-${Date.now().toString().slice(-6)}`,
      recordedBy: "Cashier Almaz Kebede",
      status: "Completed",
      notes: payNotes,
      previousBalanceETB: activePayInvoice.outstandingBalanceETB,
      remainingBalanceETB: remainingBalanceAfterPay,
    }

    // Update invoice balance
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === activePayInvoice.id) {
        const newPaid = inv.paidAmountETB + payAmountNum
        const newBalance = Math.max(0, inv.totalAmountETB - newPaid)
        const newStatus: InvoiceStatus = newBalance === 0 ? "Paid" : "Partially Paid"
        return {
          ...inv,
          paidAmountETB: newPaid,
          outstandingBalanceETB: newBalance,
          status: newStatus,
        }
      }
      return inv
    })

    setPayments([newReceipt, ...payments])
    setInvoices(updatedInvoices)
    setRecordPaymentOpen(false)
    setPrintableReceiptOpen(newReceipt)
    showToast(`Payment of ${formatETB(payAmountNum)} recorded! Official Receipt: ${newReceiptId}`)
  }

  // ── Access check ──
  if (!isAuthorized || state === "restricted") {
    return (
      <div className="hb-page-wrapper">
        <div className="hb-header">
          <div className="hb-breadcrumb">
            <span className="hb-breadcrumb-item">Hospital Operations</span>
            <Icon name="chevron" size={12} />
            <span className="hb-breadcrumb-active">Billing &amp; Finance</span>
          </div>
          <div className="hb-header-main">
            <div className="hb-header-title">
              <h1>Billing Overview</h1>
              <p>Oda Roba General Hospital — Cashier &amp; Financial Operations</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #dbe5e5" }}>
          <Icon name="shield" size={40} style={{ color: "#ac393d", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "18px", color: "#142e42", margin: "0 0 8px" }}>Access Restricted</h2>
          <p style={{ color: "#5a7184", maxWidth: "480px", margin: "0 auto 20px" }}>
            You do not possess cashier, billing, or financial management permissions to access hospital accounting records.
          </p>
          <Button className="button" onClick={() => onNavigate("home")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="hb-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#142e42",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "6px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13.5px",
            fontWeight: 500,
          }}
        >
          <Icon name="check" size={16} style={{ color: "#10b981" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <header className="hb-header">
        <nav aria-label="Breadcrumbs" className="hb-breadcrumb">
          <span className="hb-breadcrumb-item" onClick={() => onNavigate("home")}>
            Hospital Operations
          </span>
          <Icon name="chevron" size={12} />
          <span className="hb-breadcrumb-active">
            {activeTab === "overview"
              ? "Billing Overview"
              : activeTab === "invoices"
              ? "Invoice Management"
              : activeTab === "payments"
              ? "Payment Processing"
              : activeTab === "payment-history"
              ? "Payment History"
              : "Financial Reports"}
          </span>
        </nav>

        <div className="hb-header-main">
          <div className="hb-header-title">
            <h1>
              {activeTab === "overview" && "Billing Overview"}
              {activeTab === "invoices" && "Invoices"}
              {activeTab === "payments" && "Payment Processing"}
              {activeTab === "payment-history" && "Payment History"}
              {activeTab === "reports" && "Financial Reports"}
            </h1>
            <p>
              {activeTab === "overview" && "Monitor invoices, payments, and outstanding balances."}
              {activeTab === "invoices" && "Manage patient invoices, service tariffs, and billing accounts."}
              {activeTab === "payments" && "Fast cashier point-of-sale workflow for recording authorized payments."}
              {activeTab === "payment-history" && "Auditable history of all receipts and transactions collected."}
              {activeTab === "reports" && "Hospital revenue analytics, service collection breakdown, and financial audits."}
            </p>
          </div>

          <div className="hb-header-actions">
            <div className="hb-header-pill" title="Active Cashier Desk">
              <Icon name="building" size={14} />
              <span>Oda Roba Cashier Desk · Bale Robe</span>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => setExportModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="download" size={14} />
              Export
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                const unpaid = invoices.find((i) => i.outstandingBalanceETB > 0)
                if (unpaid) openPaymentForInvoice(unpaid)
                else setRecordPaymentOpen(true)
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="credit-card" size={14} />
              Record Payment
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={() => setCreateInvoiceOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="plus" size={14} />
              Create Invoice
            </button>
          </div>
        </div>
      </header>

      {/* Five Navigation Tabs */}
      <nav className="hb-tabs-bar" role="tablist" aria-label="Billing Sub-modules">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`hb-tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Icon name="grid" size={15} />
          Billing Overview
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "invoices"}
          className={`hb-tab-button ${activeTab === "invoices" ? "active" : ""}`}
          onClick={() => setActiveTab("invoices")}
        >
          <Icon name="file-text" size={15} />
          Invoices
          <span className="hb-tab-count">{invoices.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "payments"}
          className={`hb-tab-button ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          <Icon name="credit-card" size={15} />
          Payments
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "payment-history"}
          className={`hb-tab-button ${activeTab === "payment-history" ? "active" : ""}`}
          onClick={() => setActiveTab("payment-history")}
        >
          <Icon name="clock" size={15} />
          Payment History
          <span className="hb-tab-count">{payments.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reports"}
          className={`hb-tab-button ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <Icon name="download" size={15} />
          Financial Reports
        </button>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN A: BILLING OVERVIEW (DASHBOARD)
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {/* Summary Financial Cards */}
          <section className="hb-summary-grid" aria-label="Financial Summary Cards">
            {/* Card 1: Today's Invoiced */}
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Today's Invoiced</span>
                <Icon name="file-text" size={16} />
              </div>
              <div className="hb-summary-amount">{formatETB(todayInvoiced)}</div>
              <div className="hb-summary-subtext">Issued for patient services today</div>
            </div>

            {/* Card 2: Today's Payments Collected */}
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span style={{ color: "#137333" }}>Payments Received</span>
                <Icon name="check" size={16} style={{ color: "#137333" }} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#137333" }}>
                {formatETB(todayPayments)}
              </div>
              <div className="hb-summary-subtext">Verified collected revenue today</div>
            </div>

            {/* Card 3: Outstanding Balances */}
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span style={{ color: "#0369a1" }}>Outstanding Balances</span>
                <Icon name="clock" size={16} style={{ color: "#0369a1" }} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#0369a1" }}>
                {formatETB(totalOutstanding)}
              </div>
              <div className="hb-summary-subtext">Remaining across all active accounts</div>
            </div>

            {/* Card 4: Partially Paid Invoices */}
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span style={{ color: "#b45309" }}>Partially Paid</span>
                <Icon name="edit" size={16} style={{ color: "#b45309" }} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#b45309" }}>
                {partiallyPaidCount} Invoices
              </div>
              <div className="hb-summary-subtext">Partial settlements on record</div>
            </div>

            {/* Card 5: Overdue Invoices */}
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span style={{ color: "#b91c1c" }}>Overdue Invoices</span>
                <Icon name="alert-triangle" size={16} style={{ color: "#b91c1c" }} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#b91c1c" }}>
                {formatETB(overdueAmount)}
              </div>
              <div className="hb-summary-subtext">{overdueCount} accounts past due date</div>
            </div>
          </section>

          {/* Main Dashboard Split Grid */}
          <div className="hb-dashboard-split">
            {/* Left Column: Recent Invoices & Outstanding Accounts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Recent Invoices Card */}
              <div className="hb-card-panel">
                <div className="hb-card-title">
                  <h3>Recent Invoices</h3>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                    onClick={() => setActiveTab("invoices")}
                  >
                    View All Invoices
                  </button>
                </div>

                <div className="hb-table-scroll">
                  <table className="hb-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Patient Name</th>
                        <th>Issue Date</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                        <th style={{ textAlign: "right" }}>Balance Due</th>
                        <th>Status</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.slice(0, 5).map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedInvoice(inv)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#142e42" }}>{inv.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{inv.patientName}</div>
                            <div style={{ fontSize: "11px", color: "#5a7184" }}>{inv.patientId}</div>
                          </td>
                          <td style={{ fontSize: "12px" }}>{inv.issueDate.split("·")[0]}</td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{formatETB(inv.totalAmountETB)}</td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 700,
                              color: inv.outstandingBalanceETB > 0 ? "#b45309" : "#137333",
                            }}
                          >
                            {formatETB(inv.outstandingBalanceETB)}
                          </td>
                          <td>
                            {inv.status === "Paid" ? (
                              <span className="hb-badge hb-status-paid">Paid</span>
                            ) : inv.status === "Partially Paid" ? (
                              <span className="hb-badge hb-status-partially-paid">Partially Paid</span>
                            ) : inv.status === "Overdue" ? (
                              <span className="hb-badge hb-status-overdue">Overdue</span>
                            ) : (
                              <span className="hb-badge hb-status-issued">Issued</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {inv.outstandingBalanceETB > 0 && (
                              <button
                                type="button"
                                className="button button-primary"
                                style={{ padding: "3px 8px", fontSize: "11.5px" }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openPaymentForInvoice(inv)
                                }}
                              >
                                Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outstanding Balances Queue */}
              <div className="hb-card-panel">
                <div className="hb-card-title">
                  <div>
                    <h3>Outstanding Balances Requiring Cashier Collection</h3>
                    <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                      Patients with pending balances prior to discharge or laboratory result release
                    </p>
                  </div>
                </div>

                <div className="hb-table-scroll">
                  <table className="hb-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Encounter</th>
                        <th>Department</th>
                        <th style={{ textAlign: "right" }}>Balance Due</th>
                        <th>Due Date</th>
                        <th style={{ textAlign: "center" }}>Cashier Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices
                        .filter((inv) => inv.outstandingBalanceETB > 0)
                        .slice(0, 4)
                        .map((inv) => (
                          <tr key={inv.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{inv.patientName}</div>
                              <div style={{ fontSize: "11px", color: "#5a7184" }}>
                                {inv.patientId} · Inv: {inv.id}
                              </div>
                            </td>
                            <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{inv.encounterId}</td>
                            <td style={{ fontSize: "12.5px" }}>{inv.department}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#b91c1c", fontSize: "13.5px" }}>
                              {formatETB(inv.outstandingBalanceETB)}
                            </td>
                            <td style={{ fontSize: "12px" }}>{inv.dueDate}</td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="button button-primary"
                                style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                onClick={() => openPaymentForInvoice(inv)}
                              >
                                <Icon name="credit-card" size={12} />
                                Record Payment
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Revenue Trends & Payment Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Daily Collections Chart */}
              <div className="hb-card-panel">
                <div className="hb-card-title">
                  <h3>7-Day Collections Trend</h3>
                  <span style={{ fontSize: "11px", color: "#5a7184" }}>Cash &amp; Digital Collections</span>
                </div>

                <div style={{ height: "140px", display: "flex", alignItems: "flex-end", gap: "12px", padding: "10px 0 4px" }}>
                  {[
                    { day: "10 Oct", amount: 1450, max: 2500 },
                    { day: "11 Oct", amount: 1980, max: 2500 },
                    { day: "12 Oct", amount: 1120, max: 2500 },
                    { day: "13 Oct", amount: 1650, max: 2500 },
                    { day: "14 Oct", amount: 2100, max: 2500 },
                    { day: "15 Oct", amount: 2350, max: 2500 },
                    { day: "Today", amount: todayPayments || 1850, max: 2500 },
                  ].map((bar, i) => {
                    const heightPercent = Math.min(100, (bar.amount / bar.max) * 100)
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#142e42" }}>
                          {(bar.amount / 1000).toFixed(1)}k
                        </span>
                        <div
                          style={{
                            width: "100%",
                            height: `${heightPercent}%`,
                            backgroundColor: bar.day === "Today" ? "#087e83" : "#94d2d4",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.3s ease",
                          }}
                        />
                        <span style={{ fontSize: "10.5px", color: "#5a7184" }}>{bar.day}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ fontSize: "11.5px", color: "#5a7184", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "8px" }}>
                  * Reflects actual collected payments. Invoiced totals without collection are excluded.
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="hb-card-panel">
                <div className="hb-card-title">
                  <h3>Payment Method Distribution</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600 }}>Telebirr (Ethio Telecom)</span>
                      <strong>42% (1,050.00 ETB)</strong>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "42%", height: "100%", backgroundColor: "#0284c7" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600 }}>Physical Cash</span>
                      <strong>31% (775.00 ETB)</strong>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "31%", height: "100%", backgroundColor: "#10b981" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600 }}>CBE Birr / Bank Transfer</span>
                      <strong>27% (675.00 ETB)</strong>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "27%", height: "100%", backgroundColor: "#f59e0b" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Payment Receipts */}
              <div className="hb-card-panel">
                <div className="hb-card-title">
                  <h3>Recent Receipts</h3>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                    onClick={() => setActiveTab("payment-history")}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {payments.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "8px 10px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "12.5px", color: "#142e42" }}>
                          {p.patientName}
                        </div>
                        <div style={{ fontSize: "11px", color: "#5a7184" }}>
                          {p.id} · {p.paymentMethod}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#137333", fontSize: "13px" }}>
                          {formatETB(p.amountPaidETB)}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#64748b" }}>{p.paymentDate.split("·")[0]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN B: INVOICE MANAGEMENT & INVOICE LIST
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "invoices" && (
        <>
          {/* Invoices Toolbar */}
          <section className="hb-toolbar" aria-label="Invoice Search & Filters">
            <div className="hb-toolbar-row">
              <div className="hb-search-box">
                <span className="hb-search-icon">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="text"
                  className="hb-search-input"
                  placeholder="Search invoice number, patient name, MRN, or encounter…"
                  value={invoiceSearch}
                  onChange={(e) => {
                    setInvoiceSearch(e.target.value)
                    setInvoicePage(1)
                  }}
                />
              </div>

              <select
                className="hb-filter-select"
                value={invoiceStatusFilter}
                onChange={(e) => {
                  setInvoiceStatusFilter(e.target.value)
                  setInvoicePage(1)
                }}
              >
                <option value="All Statuses">All Invoice Statuses</option>
                <option value="Issued">Issued (Unpaid)</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid in Full</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
              </select>

              <select
                className="hb-filter-select"
                value={invoiceDeptFilter}
                onChange={(e) => {
                  setInvoiceDeptFilter(e.target.value)
                  setInvoicePage(1)
                }}
              >
                <option value="All Departments">All Departments</option>
                <option value="Adult OPD-1">Adult OPD-1</option>
                <option value="Adult OPD-2">Adult OPD-2</option>
                <option value="Emergency Department">Emergency Department</option>
                <option value="Maternal Health Clinic">Maternal Health (ANC)</option>
                <option value="Pediatric / Youth">Pediatric / Youth</option>
                <option value="Non-Communicable Diseases">NCD / Chronic Care</option>
              </select>
            </div>

            {/* Active Chips */}
            {(invoiceSearch.trim() || invoiceStatusFilter !== "All Statuses" || invoiceDeptFilter !== "All Departments") && (
              <div className="hb-active-chips">
                <span className="hb-active-chips-label">Active Filters:</span>
                {invoiceSearch && (
                  <span className="hb-chip">
                    "{invoiceSearch}"
                    <button type="button" onClick={() => setInvoiceSearch("")}>
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                )}
                {invoiceStatusFilter !== "All Statuses" && (
                  <span className="hb-chip">
                    Status: {invoiceStatusFilter}
                    <button type="button" onClick={() => setInvoiceStatusFilter("All Statuses")}>
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                )}
                {invoiceDeptFilter !== "All Departments" && (
                  <span className="hb-chip">
                    Dept: {invoiceDeptFilter}
                    <button type="button" onClick={() => setInvoiceDeptFilter("All Departments")}>
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="hb-clear-filters-btn"
                  onClick={() => {
                    setInvoiceSearch("")
                    setInvoiceStatusFilter("All Statuses")
                    setInvoiceDeptFilter("All Departments")
                    setInvoicePage(1)
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* Invoices Table */}
          <section className="hb-table-container">
            <div className="hb-table-header-meta">
              <div>
                Showing <strong>{filteredInvoices.length}</strong> of <strong>{invoices.length}</strong> hospital invoices
              </div>
              <div style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
                <span>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#137333", marginRight: 4 }} />
                  Paid
                </span>
                <span>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#b45309", marginRight: 4 }} />
                  Partial
                </span>
                <span>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#0369a1", marginRight: 4 }} />
                  Issued
                </span>
                <span>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#b91c1c", marginRight: 4 }} />
                  Overdue
                </span>
              </div>
            </div>

            <div className="hb-table-scroll">
              <table className="hb-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Patient Name</th>
                    <th>MRN / Encounter</th>
                    <th>Department</th>
                    <th>Invoice Date</th>
                    <th style={{ textAlign: "right" }}>Total Amount</th>
                    <th style={{ textAlign: "right" }}>Amount Paid</th>
                    <th style={{ textAlign: "right" }}>Balance Due</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "#5a7184" }}>
                        <Icon name="search" size={28} style={{ color: "#a0b0b9", marginBottom: "8px" }} />
                        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>No invoices match the filter criteria</p>
                        <p style={{ margin: 0, fontSize: "12px" }}>Try clearing search keywords or department filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        style={{ cursor: "pointer" }}
                      >
                        <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#142e42" }}>{inv.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{inv.patientName}</div>
                          <div style={{ fontSize: "11px", color: "#5a7184" }}>
                            {inv.patientAge}y, {inv.patientGender}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px", fontFamily: "monospace" }}>{inv.patientId}</div>
                          <div style={{ fontSize: "11px", color: "#7a8f9f" }}>{inv.encounterId}</div>
                        </td>
                        <td style={{ fontSize: "12.5px" }}>{inv.department}</td>
                        <td style={{ fontSize: "12px" }}>{inv.issueDate.split("·")[0]}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{formatETB(inv.totalAmountETB)}</td>
                        <td style={{ textAlign: "right", color: "#137333", fontWeight: 600 }}>
                          {formatETB(inv.paidAmountETB)}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: inv.outstandingBalanceETB > 0 ? "#b45309" : "#64748b",
                          }}
                        >
                          {formatETB(inv.outstandingBalanceETB)}
                        </td>
                        <td>
                          {inv.status === "Paid" ? (
                            <span className="hb-badge hb-status-paid">Paid</span>
                          ) : inv.status === "Partially Paid" ? (
                            <span className="hb-badge hb-status-partially-paid">Partially Paid</span>
                          ) : inv.status === "Overdue" ? (
                            <span className="hb-badge hb-status-overdue">Overdue</span>
                          ) : inv.status === "Draft" ? (
                            <span className="hb-badge hb-status-draft">Draft</span>
                          ) : (
                            <span className="hb-badge hb-status-issued">Issued</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="button button-secondary"
                              style={{ padding: "4px 8px", fontSize: "11.5px" }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedInvoice(inv)
                              }}
                              title="View itemized invoice and print"
                            >
                              Details
                            </button>
                            {inv.outstandingBalanceETB > 0 && (
                              <button
                                type="button"
                                className="button button-primary"
                                style={{ padding: "4px 8px", fontSize: "11.5px" }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openPaymentForInvoice(inv)
                                }}
                                title="Record payment for this invoice"
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="hb-pagination">
              <div>
                Page <strong>{invoicePage}</strong> of <strong>{totalInvoicePages}</strong> (
                {filteredInvoices.length} invoices)
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={invoicePage <= 1}
                  onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={invoicePage >= totalInvoicePages}
                  onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN C: PAYMENT PROCESSING (CASHIER POINT-OF-SALE WORKSPACE)
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "payments" && (
        <div style={{ maxWidth: "880px", margin: "0 auto", width: "100%" }}>
          <div className="hb-card-panel">
            <div className="hb-card-title">
              <div>
                <h2>Cashier Payment Processing Window</h2>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#5a7184" }}>
                  Record payments against issued hospital invoices with instant receipt generation.
                </p>
              </div>
              <span className="hb-header-pill">
                <Icon name="user" size={13} />
                Cashier: Almaz Kebede
              </span>
            </div>

            {/* Step 1: Select Invoice */}
            <div style={{ padding: "16px", backgroundColor: "#f8fafc", border: "1px solid #dbe5e5", borderRadius: "6px", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#142e42", marginBottom: "8px" }}>
                1. Select Patient Invoice
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                  className="hb-filter-select"
                  style={{ flex: 1 }}
                  value={payTargetInvId}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i.id === e.target.value)
                    if (inv) openPaymentForInvoice(inv)
                    else setPayTargetInvId(e.target.value)
                  }}
                >
                  <option value="">-- Choose an unpaid or partially paid invoice --</option>
                  {invoices
                    .filter((inv) => inv.outstandingBalanceETB > 0)
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} — {inv.patientName} ({inv.patientId}) — Due: {formatETB(inv.outstandingBalanceETB)}
                      </option>
                    ))}
                </select>
              </div>

              {activePayInvoice && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "10px",
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div>
                    <span style={{ color: "#64748b" }}>Patient:</span>{" "}
                    <strong>{activePayInvoice.patientName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>MRN:</span>{" "}
                    <strong style={{ fontFamily: "monospace" }}>{activePayInvoice.patientId}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Total Invoice:</span>{" "}
                    <strong>{formatETB(activePayInvoice.totalAmountETB)}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Already Paid:</span>{" "}
                    <span style={{ color: "#137333", fontWeight: 600 }}>{formatETB(activePayInvoice.paidAmountETB)}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Balance Due:</span>{" "}
                    <strong style={{ color: "#b91c1c" }}>{formatETB(activePayInvoice.outstandingBalanceETB)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Payment Entry & Calculation */}
            {activePayInvoice ? (
              <form onSubmit={handleExecutePayment}>
                {payError && (
                  <div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c", fontSize: "12.5px", marginBottom: "14px" }}>
                    {payError}
                  </div>
                )}

                <div className="hb-form-row">
                  <div className="hb-form-field">
                    <label className="hb-form-label">
                      Payment Amount (ETB) <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="hb-form-input"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      required
                    />
                    <small style={{ color: "#64748b", fontSize: "11px" }}>
                      Max allowable: {formatETB(activePayInvoice.outstandingBalanceETB)}
                    </small>
                  </div>

                  <div className="hb-form-field">
                    <label className="hb-form-label">
                      Payment Method <span className="req">*</span>
                    </label>
                    <select
                      className="hb-filter-select"
                      style={{ width: "100%" }}
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="hb-form-row" style={{ marginTop: "12px" }}>
                  <div className="hb-form-field">
                    <label className="hb-form-label">Transaction / Reference Number</label>
                    <input
                      type="text"
                      className="hb-form-input"
                      placeholder={payMethod === "Cash" ? "e.g., CASH-DRAWER-01" : "e.g., TB-ET-982410"}
                      value={payTxnRef}
                      onChange={(e) => setPayTxnRef(e.target.value)}
                    />
                  </div>

                  {payMethod === "Cash" && (
                    <div className="hb-form-field">
                      <label className="hb-form-label">Cash Tendered by Patient (ETB)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="hb-form-input"
                        placeholder="e.g., 1000"
                        value={payCashTendered}
                        onChange={(e) => setPayCashTendered(e.target.value)}
                      />
                      {cashTenderedNum > 0 && (
                        <span style={{ fontSize: "12px", color: changeDue >= 0 ? "#137333" : "#b91c1c", fontWeight: 600, marginTop: "2px" }}>
                          Change to Return: {formatETB(changeDue)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Balance Preview Card */}
                <div
                  style={{
                    margin: "18px 0",
                    padding: "14px",
                    backgroundColor: "#f0fdfa",
                    border: "1px solid #99f6e4",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#0f766e", textTransform: "uppercase", fontWeight: 700 }}>
                      Live Balance Reconciliation
                    </div>
                    <div style={{ fontSize: "13px", color: "#134e4a", marginTop: "2px" }}>
                      Current: {formatETB(activePayInvoice.outstandingBalanceETB)} − Payment: {formatETB(payAmountNum)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#0f766e", textTransform: "uppercase" }}>Remaining Balance</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: remainingBalanceAfterPay === 0 ? "#137333" : "#0f766e" }}>
                      {formatETB(remainingBalanceAfterPay)}
                    </div>
                  </div>
                </div>

                <div className="hb-form-field">
                  <label className="hb-form-label">Receipt / Payment Notes</label>
                  <input
                    type="text"
                    className="hb-form-input"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setPayTargetInvId("")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Icon name="check" size={14} />
                    Confirm &amp; Issue Receipt ({formatETB(payAmountNum)})
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#5a7184" }}>
                <Icon name="credit-card" size={32} style={{ color: "#a0b0b9", marginBottom: "8px" }} />
                <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#142e42" }}>No Invoice Selected</p>
                <p style={{ margin: 0, fontSize: "12.5px" }}>
                  Select an active invoice from the dropdown above to enter payment details and issue an official receipt.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN D: PAYMENT HISTORY
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "payment-history" && (
        <>
          {/* Summary metrics for history */}
          <div className="hb-summary-grid">
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Total Collected</span>
                <Icon name="check" size={16} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#137333" }}>
                {formatETB(payments.reduce((acc, p) => acc + p.amountPaidETB, 0))}
              </div>
              <div className="hb-summary-subtext">All completed transactions</div>
            </div>

            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Cash Receipts</span>
                <Icon name="building" size={16} />
              </div>
              <div className="hb-summary-amount">
                {formatETB(
                  payments.filter((p) => p.paymentMethod === "Cash").reduce((acc, p) => acc + p.amountPaidETB, 0)
                )}
              </div>
              <div className="hb-summary-subtext">Physical drawer balance logged</div>
            </div>

            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Telebirr &amp; Mobile</span>
                <Icon name="credit-card" size={16} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#0284c7" }}>
                {formatETB(
                  payments
                    .filter((p) => p.paymentMethod === "Telebirr" || p.paymentMethod === "CBE Birr")
                    .reduce((acc, p) => acc + p.amountPaidETB, 0)
                )}
              </div>
              <div className="hb-summary-subtext">Electronic payments verified</div>
            </div>

            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Transactions</span>
                <Icon name="receipt" size={16} />
              </div>
              <div className="hb-summary-amount">{payments.length} Receipts</div>
              <div className="hb-summary-subtext">Official receipts issued</div>
            </div>
          </div>

          {/* Payment History Toolbar */}
          <section className="hb-toolbar" aria-label="Payment History Filters">
            <div className="hb-toolbar-row">
              <div className="hb-search-box">
                <span className="hb-search-icon">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="text"
                  className="hb-search-input"
                  placeholder="Search receipt #, patient name, invoice #, or transaction reference…"
                  value={paymentSearch}
                  onChange={(e) => {
                    setPaymentSearch(e.target.value)
                    setPaymentPage(1)
                  }}
                />
              </div>

              <select
                className="hb-filter-select"
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value)
                  setPaymentPage(1)
                }}
              >
                <option value="All Methods">All Payment Methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Payment History Table */}
          <section className="hb-table-container">
            <div className="hb-table-scroll">
              <table className="hb-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Payment Date &amp; Time</th>
                    <th>Patient Name</th>
                    <th>Invoice #</th>
                    <th>Payment Method</th>
                    <th>Transaction Reference</th>
                    <th style={{ textAlign: "right" }}>Amount Collected</th>
                    <th>Recorded By</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedReceipt(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#142e42" }}>{p.id}</td>
                      <td style={{ fontSize: "12px" }}>{p.paymentDate}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.patientName}</div>
                        <div style={{ fontSize: "11px", color: "#5a7184" }}>{p.patientId}</div>
                      </td>
                      <td style={{ fontSize: "12px", fontFamily: "monospace", color: "#087e83" }}>{p.invoiceId}</td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{p.paymentMethod}</span>
                      </td>
                      <td style={{ fontSize: "12px", fontFamily: "monospace", color: "#475569" }}>
                        {p.transactionReference}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#137333", fontSize: "13.5px" }}>
                        {formatETB(p.amountPaidETB)}
                      </td>
                      <td style={{ fontSize: "12px" }}>{p.recordedBy}</td>
                      <td>
                        <span className="hb-badge hb-status-paid">{p.status}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="button button-secondary"
                          style={{ padding: "4px 8px", fontSize: "11.5px" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPrintableReceiptOpen(p)
                          }}
                          title="Print official receipt slip"
                        >
                          <Icon name="printer" size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="hb-pagination">
              <div>
                Page <strong>{paymentPage}</strong> of <strong>{totalPaymentPages}</strong> ({filteredPayments.length} receipts)
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={paymentPage <= 1}
                  onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={paymentPage >= totalPaymentPages}
                  onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages, p + 1))}
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN E: FINANCIAL REPORTS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Reports Toolbar */}
          <div className="hb-toolbar">
            <div className="hb-toolbar-row">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#142e42" }}>Reporting Period:</span>
                <button
                  type="button"
                  className={`button ${reportPeriod === "today" ? "button-primary" : "button-secondary"}`}
                  style={{ padding: "5px 12px", fontSize: "12.5px" }}
                  onClick={() => setReportPeriod("today")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`button ${reportPeriod === "7days" ? "button-primary" : "button-secondary"}`}
                  style={{ padding: "5px 12px", fontSize: "12.5px" }}
                  onClick={() => setReportPeriod("7days")}
                >
                  Past 7 Days
                </button>
                <button
                  type="button"
                  className={`button ${reportPeriod === "month" ? "button-primary" : "button-secondary"}`}
                  style={{ padding: "5px 12px", fontSize: "12.5px" }}
                  onClick={() => setReportPeriod("month")}
                >
                  Month-to-Date (October 2026)
                </button>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => showToast("Financial Report exported to CSV.")}
                >
                  <Icon name="download" size={14} />
                  Export CSV
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => showToast("Financial summary printed.")}
                >
                  <Icon name="printer" size={14} />
                  Print Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Reporting KPIs */}
          <div className="hb-summary-grid">
            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Total Collected Revenue</span>
                <Icon name="check" size={16} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#137333" }}>
                {formatETB(payments.reduce((acc, p) => acc + p.amountPaidETB, 0))}
              </div>
              <div className="hb-summary-subtext">Verified collected cash &amp; digital deposits</div>
            </div>

            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Total Invoiced</span>
                <Icon name="file-text" size={16} />
              </div>
              <div className="hb-summary-amount">
                {formatETB(invoices.reduce((acc, p) => acc + p.totalAmountETB, 0))}
              </div>
              <div className="hb-summary-subtext">Cumulative billable services issued</div>
            </div>

            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Outstanding Accounts</span>
                <Icon name="alert-triangle" size={16} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#b91c1c" }}>
                {formatETB(totalOutstanding)}
              </div>
              <div className="hb-summary-subtext">Remaining hospital receivables</div>
            </div>

            <div className="hb-summary-card">
              <div className="hb-summary-top">
                <span>Collection Efficiency</span>
                <Icon name="grid" size={16} />
              </div>
              <div className="hb-summary-amount" style={{ color: "#087e83" }}>
                48.4%
              </div>
              <div className="hb-summary-subtext">Collected vs. Invoiced ratio</div>
            </div>
          </div>

          {/* Service Category Revenue Breakdown Table */}
          <div className="hb-card-panel">
            <div className="hb-card-title">
              <h3>Service Category Revenue Contribution</h3>
              <span style={{ fontSize: "12px", color: "#5a7184" }}>Categorical distribution of billed services</span>
            </div>

            <table className="hb-table">
              <thead>
                <tr>
                  <th>Service Category</th>
                  <th>Tariff Code Scope</th>
                  <th style={{ textAlign: "right" }}>Standard Unit Rate</th>
                  <th style={{ textAlign: "right" }}>Sample Volume</th>
                  <th style={{ textAlign: "right" }}>Revenue Generated</th>
                  <th>Share of Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "Consultation", scope: "SRV-CNS-01 to 03", rate: "150 - 350 ETB", vol: 24, rev: 4200, share: "24.5%" },
                  { cat: "Laboratory Investigations", scope: "SRV-LAB-01 to 06", rate: "70 - 210 ETB", vol: 38, rev: 4950, share: "28.8%" },
                  { cat: "Diagnostic Imaging (X-Ray/US)", scope: "SRV-IMG-01 to 03", rate: "320 - 450 ETB", vol: 12, rev: 4320, share: "25.2%" },
                  { cat: "Medication & Infusions", scope: "SRV-MED-01 to 06", rate: "25 - 180 ETB", vol: 28, rev: 2150, share: "12.5%" },
                  { cat: "Emergency & Inpatient Beds", scope: "SRV-BED/EMG-01", rate: "220 - 650 ETB", vol: 4, rev: 1540, share: "9.0%" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.cat}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{row.scope}</td>
                    <td style={{ textAlign: "right", fontSize: "12px" }}>{row.rate}</td>
                    <td style={{ textAlign: "right", fontWeight: 500 }}>{row.vol} items</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#142e42" }}>{formatETB(row.rev)}</td>
                    <td>
                      <span className="hb-badge hb-status-issued">{row.share}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE INVOICE MODAL ── */}
      {createInvoiceOpen && (
        <div className="hb-modal-overlay" onClick={() => setCreateInvoiceOpen(false)}>
          <div className="hb-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create Hospital Invoice">
            <div className="hb-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Create Patient Hospital Invoice
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Oda Roba General Hospital Standard Billing Form
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreateInvoiceOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="hb-modal-body">
              {/* Patient info row */}
              <div className="hb-form-row">
                <div className="hb-form-field">
                  <label className="hb-form-label">
                    Patient Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="hb-form-input"
                    value={newInvPatientName}
                    onChange={(e) => setNewInvPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="hb-form-field">
                  <label className="hb-form-label">
                    Patient MRN / ID <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="hb-form-input"
                    value={newInvPatientId}
                    onChange={(e) => setNewInvPatientId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="hb-form-row">
                <div className="hb-form-field">
                  <label className="hb-form-label">Encounter Reference</label>
                  <input
                    type="text"
                    className="hb-form-input"
                    value={newInvEncounter}
                    onChange={(e) => setNewInvEncounter(e.target.value)}
                  />
                </div>

                <div className="hb-form-field">
                  <label className="hb-form-label">Clinical Department</label>
                  <select
                    className="hb-filter-select"
                    style={{ width: "100%" }}
                    value={newInvDepartment}
                    onChange={(e) => setNewInvDepartment(e.target.value)}
                  >
                    <option value="Adult OPD-1">Adult OPD-1</option>
                    <option value="Adult OPD-2">Adult OPD-2</option>
                    <option value="Emergency Department">Emergency Department</option>
                    <option value="Maternal Health Clinic">Maternal Health (ANC)</option>
                    <option value="Pediatric / Youth">Pediatric / Youth</option>
                  </select>
                </div>
              </div>

              {/* Service Line Items Card */}
              <div style={{ padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #dbe5e5", borderRadius: "6px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#142e42", marginBottom: "8px" }}>
                  Add Billable Services &amp; Tariff Items
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "240px" }} className="hb-form-field">
                    <label className="hb-form-label">Standard Hospital Tariff</label>
                    <select
                      className="hb-filter-select"
                      style={{ width: "100%" }}
                      value={selectedTariffCode}
                      onChange={(e) => setSelectedTariffCode(e.target.value)}
                    >
                      {STANDARD_TARIFFS.map((t) => (
                        <option key={t.code} value={t.code}>
                          [{t.category}] {t.name} — {formatETB(t.defaultPriceETB)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ width: "80px" }} className="hb-form-field">
                    <label className="hb-form-label">Qty</label>
                    <input
                      type="number"
                      min="1"
                      className="hb-form-input"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleAddItemToInvoice}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "38px" }}
                  >
                    <Icon name="plus" size={14} />
                    Add Service
                  </button>
                </div>

                {/* Table of items */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#e2e8f0", borderBottom: "1px solid #cbd5e1" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Service Name</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Category</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Rate</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Qty</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Total</th>
                      <th style={{ padding: "6px 8px", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newInvItems.map((it) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 600 }}>{it.serviceName}</td>
                        <td style={{ padding: "6px 8px", fontSize: "11.5px", color: "#5a7184" }}>{it.category}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatETB(it.unitPriceETB)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>{it.quantity}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{formatETB(it.totalETB)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => handleRemoveItem(it.id)}
                            style={{ color: "#b91c1c", padding: "2px" }}
                          >
                            <Icon name="x" size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #dbe5e5",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Subtotal: {formatETB(newInvSubtotal)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontSize: "12px" }}>Discount (ETB):</span>
                    <input
                      type="number"
                      style={{ width: "80px", padding: "3px 6px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                      value={newInvDiscount}
                      onChange={(e) => setNewInvDiscount(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Grand Total Amount</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#142e42" }}>
                    {formatETB(newInvGrandTotal)}
                  </div>
                </div>
              </div>
            </div>

            <div className="hb-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setCreateInvoiceOpen(false)}
              >
                Cancel
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handleSaveInvoice("Draft")}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleSaveInvoice("Issued")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Icon name="file-text" size={14} />
                  Issue Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE DETAIL & PRINT MODAL ── */}
      {selectedInvoice && (
        <div className="hb-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="hb-modal" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Invoice Details">
            <div className="hb-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42", fontFamily: "monospace" }}>
                  {selectedInvoice.id}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Issued on {selectedInvoice.issueDate} · Due: {selectedInvoice.dueDate}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="hb-modal-body">
              {/* Formal Hospital Header */}
              <div style={{ textAlign: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#142e42", letterSpacing: "0.02em" }}>
                  ODA ROBA GENERAL HOSPITAL
                </div>
                <div style={{ fontSize: "11.5px", color: "#5a7184" }}>
                  Bale Robe, Oromia Regional State, Ethiopia · Hospital Billing Desk
                </div>
              </div>

              {/* Patient info */}
              <div className="hb-detail-grid">
                <div>
                  <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Patient Name</div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#142e42" }}>{selectedInvoice.patientName}</div>
                  <div style={{ fontSize: "11px", color: "#5a7184" }}>MRN: {selectedInvoice.patientId}</div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Encounter Reference</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace" }}>{selectedInvoice.encounterId}</div>
                  <div style={{ fontSize: "11px", color: "#5a7184" }}>Dept: {selectedInvoice.department}</div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Invoice Status</div>
                  <div>
                    {selectedInvoice.status === "Paid" ? (
                      <span className="hb-badge hb-status-paid">Paid in Full</span>
                    ) : selectedInvoice.status === "Partially Paid" ? (
                      <span className="hb-badge hb-status-partially-paid">Partially Paid</span>
                    ) : selectedInvoice.status === "Overdue" ? (
                      <span className="hb-badge hb-status-overdue">Overdue</span>
                    ) : (
                      <span className="hb-badge hb-status-issued">Issued</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Services Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #dbe5e5" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>Billed Service / Item</th>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>Category</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Rate</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Qty</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((it) => (
                    <tr key={it.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{it.serviceName}</td>
                      <td style={{ padding: "8px 10px", fontSize: "11.5px", color: "#5a7184" }}>{it.category}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>{formatETB(it.unitPriceETB)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>{it.quantity}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{formatETB(it.totalETB)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Summary */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Subtotal:</span>
                    <span>{formatETB(selectedInvoice.subtotalETB)}</span>
                  </div>
                  {selectedInvoice.discountETB > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#137333" }}>
                      <span>Discount Approved:</span>
                      <span>−{formatETB(selectedInvoice.discountETB)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13.5px", borderTop: "1px solid #cbd5e1", paddingTop: "4px" }}>
                    <span>Grand Total:</span>
                    <span>{formatETB(selectedInvoice.totalAmountETB)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#137333" }}>
                    <span>Amount Paid:</span>
                    <span>{formatETB(selectedInvoice.paidAmountETB)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: selectedInvoice.outstandingBalanceETB > 0 ? "#b91c1c" : "#137333", fontSize: "14px", borderTop: "1px solid #cbd5e1", paddingTop: "4px" }}>
                    <span>Outstanding Balance:</span>
                    <span>{formatETB(selectedInvoice.outstandingBalanceETB)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hb-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => showToast(`Invoice ${selectedInvoice.id} sent to hospital receipt printer.`)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="printer" size={14} />
                Print Invoice
              </button>

              <div style={{ display: "flex", gap: "8px" }}>
                {selectedInvoice.outstandingBalanceETB > 0 && (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      const inv = selectedInvoice
                      setSelectedInvoice(null)
                      openPaymentForInvoice(inv)
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Icon name="credit-card" size={14} />
                    Record Payment
                  </button>
                )}
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINTABLE OFFICIAL RECEIPT SLIP MODAL ── */}
      {printableReceiptOpen && (
        <div className="hb-modal-overlay" onClick={() => setPrintableReceiptOpen(null)}>
          <div className="hb-modal" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Official Payment Receipt">
            <div className="hb-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#142e42" }}>
                  Official Payment Receipt
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#5a7184" }}>
                  Receipt #{printableReceiptOpen.id}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPrintableReceiptOpen(null)}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="hb-modal-body">
              <div className="hb-printable-receipt">
                <div className="hb-receipt-header">
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>ODA ROBA GENERAL HOSPITAL</div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>Bale Robe, Oromia, Ethiopia</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, marginTop: "4px" }}>OFFICIAL CASH RECEIPT</div>
                </div>

                <div className="hb-receipt-row">
                  <span>Receipt No:</span>
                  <strong>{printableReceiptOpen.id}</strong>
                </div>
                <div className="hb-receipt-row">
                  <span>Date &amp; Time:</span>
                  <span>{printableReceiptOpen.paymentDate}</span>
                </div>
                <div className="hb-receipt-row">
                  <span>Patient Name:</span>
                  <strong>{printableReceiptOpen.patientName}</strong>
                </div>
                <div className="hb-receipt-row">
                  <span>Patient MRN:</span>
                  <span>{printableReceiptOpen.patientId}</span>
                </div>
                <div className="hb-receipt-row">
                  <span>Invoice Ref:</span>
                  <span>{printableReceiptOpen.invoiceId}</span>
                </div>
                <div className="hb-receipt-row">
                  <span>Payment Method:</span>
                  <strong>{printableReceiptOpen.paymentMethod}</strong>
                </div>
                <div className="hb-receipt-row">
                  <span>Transaction Ref:</span>
                  <span>{printableReceiptOpen.transactionReference}</span>
                </div>

                <div style={{ borderTop: "1px dashed #94a3b8", margin: "10px 0" }} />

                <div className="hb-receipt-row" style={{ fontSize: "14px", fontWeight: 700 }}>
                  <span>AMOUNT PAID:</span>
                  <span style={{ color: "#137333" }}>{formatETB(printableReceiptOpen.amountPaidETB)}</span>
                </div>

                <div className="hb-receipt-row" style={{ fontSize: "12px" }}>
                  <span>Remaining Balance:</span>
                  <span>{formatETB(printableReceiptOpen.remainingBalanceETB)}</span>
                </div>

                <div style={{ borderTop: "1px dashed #94a3b8", margin: "10px 0" }} />

                <div className="hb-receipt-row" style={{ fontSize: "11px" }}>
                  <span>Cashier:</span>
                  <span>{printableReceiptOpen.recordedBy}</span>
                </div>
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", marginTop: "12px" }}>
                  Thank you for visiting Oda Roba General Hospital.
                </div>
              </div>
            </div>

            <div className="hb-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setPrintableReceiptOpen(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  showToast(`Receipt ${printableReceiptOpen.id} printed.`)
                  setPrintableReceiptOpen(null)
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="printer" size={14} />
                Print Official Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORD PAYMENT MODAL (DIRECT FROM BUTTON) ── */}
      {recordPaymentOpen && (
        <div className="hb-modal-overlay" onClick={() => setRecordPaymentOpen(false)}>
          <div className="hb-modal" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Record Payment">
            <div className="hb-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Record Patient Payment
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Oda Roba General Hospital Cashier Desk
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setRecordPaymentOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleExecutePayment}>
              <div className="hb-modal-body">
                {payError && (
                  <div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c", fontSize: "12.5px" }}>
                    {payError}
                  </div>
                )}

                <div className="hb-form-field">
                  <label className="hb-form-label">Select Unpaid Hospital Invoice</label>
                  <select
                    className="hb-filter-select"
                    style={{ width: "100%" }}
                    value={payTargetInvId}
                    onChange={(e) => {
                      const inv = invoices.find((i) => i.id === e.target.value)
                      if (inv) openPaymentForInvoice(inv)
                      else setPayTargetInvId(e.target.value)
                    }}
                    required
                  >
                    <option value="">-- Choose an invoice --</option>
                    {invoices
                      .filter((inv) => inv.outstandingBalanceETB > 0)
                      .map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.id} — {inv.patientName} ({inv.patientId}) — Outstanding: {formatETB(inv.outstandingBalanceETB)}
                        </option>
                      ))}
                  </select>
                </div>

                {activePayInvoice && (
                  <>
                    <div className="hb-form-row">
                      <div className="hb-form-field">
                        <label className="hb-form-label">
                          Payment Amount (ETB) <span className="req">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="hb-form-input"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="hb-form-field">
                        <label className="hb-form-label">
                          Payment Method <span className="req">*</span>
                        </label>
                        <select
                          className="hb-filter-select"
                          style={{ width: "100%" }}
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="hb-form-row">
                      <div className="hb-form-field">
                        <label className="hb-form-label">Transaction Reference</label>
                        <input
                          type="text"
                          className="hb-form-input"
                          value={payTxnRef}
                          onChange={(e) => setPayTxnRef(e.target.value)}
                        />
                      </div>

                      {payMethod === "Cash" && (
                        <div className="hb-form-field">
                          <label className="hb-form-label">Cash Tendered (ETB)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="hb-form-input"
                            value={payCashTendered}
                            onChange={(e) => setPayCashTendered(e.target.value)}
                          />
                          {cashTenderedNum > 0 && (
                            <span style={{ fontSize: "12px", color: changeDue >= 0 ? "#137333" : "#b91c1c", fontWeight: 600, marginTop: "2px" }}>
                              Change to Return: {formatETB(changeDue)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Balance Preview Card */}
                    <div
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#f0fdfa",
                        border: "1px solid #99f6e4",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "12.5px", color: "#134e4a" }}>
                        Remaining Balance After Payment:
                      </span>
                      <strong style={{ fontSize: "15px", color: remainingBalanceAfterPay === 0 ? "#137333" : "#0f766e" }}>
                        {formatETB(remainingBalanceAfterPay)}
                      </strong>
                    </div>
                  </>
                )}
              </div>

              <div className="hb-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setRecordPaymentOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={!activePayInvoice}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Icon name="check" size={14} />
                  Record &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EXPORT MODAL ── */}
      {exportModalOpen && (
        <div className="hb-modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div className="hb-modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Export Financial Records">
            <div className="hb-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Export Financial Records
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Oda Roba General Hospital Finance Ledger
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setExportModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="hb-modal-body">
              <div className="hb-form-field">
                <label className="hb-form-label">Export Data Scope</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px", fontSize: "13px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="exportScope" defaultChecked />
                    <span>Invoices Ledger ({invoices.length} invoices)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="exportScope" />
                    <span>Payment Receipts ({payments.length} receipts)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="exportScope" />
                    <span>Complete Monthly Financial Statement</span>
                  </label>
                </div>
              </div>

              <div className="hb-form-field">
                <label className="hb-form-label">Format</label>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px", fontSize: "13px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="exportFmt" defaultChecked />
                    <span>CSV / Excel</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="exportFmt" />
                    <span>PDF Audit Statement</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="hb-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setExportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setExportModalOpen(false)
                  showToast("Financial records exported successfully.")
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="download" size={14} />
                Generate &amp; Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
