import React, { createContext, useContext, useReducer, useCallback } from 'react'

const now = new Date()
const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')

const initialPOs = [
  { id: 'PO-2024-0847', vendor: 'Pepsico Ingredients Ltd', material: 'Cola Concentrate', qty: 500, unit: 'KG', expectedDate: '25 Jun 2024', materials: [{ name: 'Cola Concentrate 30X', unit: 'KG', ordered: 500 }, { name: 'Citric Acid', unit: 'KG', ordered: 120 }] },
  { id: 'PO-2024-0848', vendor: 'SugarTech Corp', material: 'Refined Sugar', qty: 1200, unit: 'KG', expectedDate: '26 Jun 2024', materials: [{ name: 'Refined Sugar S-30', unit: 'KG', ordered: 1200 }] },
  { id: 'PO-2024-0849', vendor: 'AquaPure Solutions', material: 'DM Water', qty: 800, unit: 'Litres', expectedDate: '24 Jun 2024', materials: [{ name: 'DM Water Grade A', unit: 'Litres', ordered: 800 }] },
  { id: 'PO-2024-0850', vendor: 'PackPro Industries', material: 'Packaging Film', qty: 300, unit: 'Rolls', expectedDate: '27 Jun 2024', materials: [{ name: 'BOPP Film 30mic', unit: 'Rolls', ordered: 200 }, { name: 'Poly Lam 25mic', unit: 'Rolls', ordered: 100 }] },
]

const initialTrucks = [
  { id: 'ARR-20240624-001', vehicleNumber: 'MH12AB1234', transporter: 'Blue Dart Logistics', driver: 'Ramesh Kumar', arrivalTime: '08:15', gate: 'Gate 1', grnRaised: true, grnId: 'GRN-20240624-001' },
  { id: 'ARR-20240624-002', vehicleNumber: 'DL01CD5678', transporter: 'DTDC Freight', driver: 'Suresh Patel', arrivalTime: '09:42', gate: 'Gate 2', grnRaised: false },
  { id: 'ARR-20240624-003', vehicleNumber: 'KA05EF9012', transporter: 'Blue Dart Logistics', driver: 'Mohan Singh', arrivalTime: '11:30', gate: 'Weighbridge', grnRaised: true, grnId: 'GRN-20240624-002' },
]

const initialLots = [
  { id: 'LOT-20240624-001', material: 'Cola Concentrate 30X', vendor: 'Pepsico Ingredients Ltd', qty: 480, unit: 'KG', status: 'APPROVED', grnId: 'GRN-20240624-001', location: 'A-01/B-04', arrivedAt: new Date(now.getTime() - 6 * 3600000).toISOString(), stage: 1 },
  { id: 'LOT-20240624-002', material: 'Refined Sugar S-30', vendor: 'SugarTech Corp', qty: 1180, unit: 'KG', status: 'UNDER_QC', grnId: 'GRN-20240624-002', location: null, arrivedAt: new Date(now.getTime() - 2 * 3600000).toISOString(), stage: 1 },
  { id: 'LOT-20240624-003', material: 'DM Water Grade A', vendor: 'AquaPure Solutions', qty: 790, unit: 'Litres', status: 'HOLD', grnId: 'GRN-20240624-003', location: null, arrivedAt: new Date(now.getTime() - 4.5 * 3600000).toISOString(), stage: 1 },
]

const initialExceptions = [
  { id: 'EX-QC-01-001', code: 'EX-QC-01', type: 'QC_SLA_BREACH', severity: 'HIGH', status: 'OPEN', lotId: 'LOT-20240624-003', material: 'DM Water Grade A', triggeredAt: new Date(now.getTime() - 30 * 60000).toISOString(), actor: 'System', description: 'QC pending for >4h. SLA breached.', stage: 1 },
]

const initialBatches = [
  { id: 'BATCH-20240624-001', material: 'Cola Mix', lotIds: ['LOT-20240624-001'], startTime: new Date(now.getTime() - 3600000).toISOString(), status: 'IN_PROGRESS', pouches: 8420, rejects: 42, yield: 99.5 },
]

const initialCartons = [
  { id: 'CTN-20240624-00001', batch: 'BATCH-20240624-001', pouches: 48, status: 'CLOSED', palletId: 'PLT-20240624-001' },
]

const initialPallets = [
  { id: 'PLT-20240624-001', cartons: 24, batch: 'BATCH-20240624-001', status: 'IN_FG', location: 'FG-A-01' },
]

const initialInventory = [
  { material: 'Cola Concentrate 30X', lotId: 'LOT-20240624-001', qty: 480, unit: 'KG', location: 'A-01/B-04', status: 'AVAILABLE' },
]

const initialActivity = [
  { id: 1, type: 'LOT_APPROVED', text: 'LOT-20240624-001 approved by QA', time: new Date(now.getTime() - 5.5 * 3600000).toISOString(), route: '/stage1/qa-inspection', lotId: 'LOT-20240624-001' },
  { id: 2, type: 'GRN_SUBMITTED', text: 'GRN-20240624-002 submitted by Store', time: new Date(now.getTime() - 2 * 3600000).toISOString(), route: '/stage1/grn/new' },
  { id: 3, type: 'EXCEPTION', text: 'EX-QC-01 raised — SLA breach on LOT-20240624-003', time: new Date(now.getTime() - 30 * 60000).toISOString(), route: '/exceptions', severity: 'HIGH' },
  { id: 4, type: 'TRUCK_ARRIVED', text: 'Vehicle KA05EF9012 logged at Weighbridge', time: new Date(now.getTime() - 2.5 * 3600000).toISOString(), route: '/stage1/truck-arrival' },
  { id: 5, type: 'BATCH_STARTED', text: 'BATCH-20240624-001 started — Cola Mix', time: new Date(now.getTime() - 3600000).toISOString(), route: '/stage3/dumping' },
]

const initialState = {
  trucks: initialTrucks,
  purchaseOrders: initialPOs,
  lots: initialLots,
  exceptions: initialExceptions,
  inventory: initialInventory,
  batches: initialBatches,
  cartons: initialCartons,
  pallets: initialPallets,
  activity: initialActivity,
  toasts: [],
  role: 'Store Operator',
  lotCounter: 4,
  truckCounter: 4,
  exceptionCounter: 2,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOG_TRUCK': {
      const id = `ARR-${dateStr}-00${state.truckCounter}`
      const truck = { id, ...action.payload, grnRaised: false, arrivalTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
      return {
        ...state,
        truckCounter: state.truckCounter + 1,
        trucks: [truck, ...state.trucks],
        activity: [{ id: Date.now(), type: 'TRUCK_ARRIVED', text: `Vehicle ${action.payload.vehicleNumber} logged at ${action.payload.gate}`, time: new Date().toISOString(), route: '/stage1/truck-arrival' }, ...state.activity].slice(0, 20),
      }
    }
    case 'SUBMIT_GRN': {
      const lotId = `LOT-${dateStr}-00${state.lotCounter}`
      const lot = {
        id: lotId,
        material: action.payload.material,
        vendor: action.payload.vendor,
        qty: action.payload.qty,
        unit: action.payload.unit || 'KG',
        status: 'UNDER_QC',
        grnId: action.payload.grnId,
        location: null,
        arrivedAt: new Date().toISOString(),
        stage: 1,
        vehicleNumber: action.payload.vehicleNumber,
        expiryDate: action.payload.expiryDate,
      }
      const updatedTrucks = state.trucks.map(t =>
        t.vehicleNumber === action.payload.vehicleNumber ? { ...t, grnRaised: true, grnId: action.payload.grnId } : t
      )
      return {
        ...state,
        lotCounter: state.lotCounter + 1,
        lots: [lot, ...state.lots],
        trucks: updatedTrucks,
        activity: [{ id: Date.now(), type: 'GRN_SUBMITTED', text: `${action.payload.grnId} submitted → ${lotId} created`, time: new Date().toISOString(), route: '/stage1/qa-inspection', lotId }, ...state.activity].slice(0, 20),
      }
    }
    case 'QA_DECISION': {
      const { lotId, decision, rejectionReason, reinspectionDate } = action.payload
      const newStatus = decision === 'PASS' ? 'APPROVED' : decision === 'HOLD' ? 'HOLD' : 'REJECTED'
      const updatedLots = state.lots.map(l => l.id === lotId ? { ...l, status: newStatus, qcDecision: decision, rejectionReason, reinspectionDate, qcAt: new Date().toISOString() } : l)
      let newExceptions = [...state.exceptions]
      let newActivity = [{ id: Date.now(), type: decision === 'PASS' ? 'LOT_APPROVED' : 'LOT_' + decision, text: `${lotId} QA ${decision} — ${newStatus}`, time: new Date().toISOString(), route: '/stage1/qa-inspection', lotId }, ...state.activity].slice(0, 20)
      if (decision === 'REJECT') {
        const exId = `EX-QC-02-00${state.exceptionCounter}`
        newExceptions = [{ id: exId, code: 'EX-QC-02', type: 'LOT_REJECTED', severity: 'HIGH', status: 'OPEN', lotId, triggeredAt: new Date().toISOString(), actor: 'QA Supervisor', description: `Lot ${lotId} rejected. Reason: ${rejectionReason}. Return to vendor required.`, stage: 1 }, ...newExceptions]
        newActivity = [{ id: Date.now() + 1, type: 'EXCEPTION', text: `EX-QC-02 raised — ${lotId} rejected`, time: new Date().toISOString(), route: '/exceptions', severity: 'HIGH' }, ...newActivity].slice(0, 20)
        return { ...state, lots: updatedLots, exceptions: newExceptions, exceptionCounter: state.exceptionCounter + 1, activity: newActivity }
      }
      return { ...state, lots: updatedLots, exceptions: newExceptions, activity: newActivity }
    }
    case 'CONFIRM_PUT_AWAY': {
      const { lotId, location, pallets, bags } = action.payload
      const updatedLots = state.lots.map(l => l.id === lotId ? { ...l, location, status: 'AVAILABLE', putAwayAt: new Date().toISOString() } : l)
      const lot = state.lots.find(l => l.id === lotId)
      const newInventory = [{ material: lot?.material, lotId, qty: lot?.qty, unit: lot?.unit || 'KG', location, status: 'AVAILABLE', pallets, bags }, ...state.inventory]
      return {
        ...state,
        lots: updatedLots,
        inventory: newInventory,
        activity: [{ id: Date.now(), type: 'PUT_AWAY', text: `${lotId} put away at ${location}`, time: new Date().toISOString(), route: '/stage1/put-away', lotId }, ...state.activity].slice(0, 20),
      }
    }
    case 'RAISE_EXCEPTION': {
      const ex = { id: `EX-${Date.now()}`, ...action.payload, triggeredAt: new Date().toISOString(), status: 'OPEN' }
      return {
        ...state,
        exceptions: [ex, ...state.exceptions],
        exceptionCounter: state.exceptionCounter + 1,
        activity: [{ id: Date.now(), type: 'EXCEPTION', text: `${ex.code} raised — ${ex.description?.slice(0, 60)}`, time: new Date().toISOString(), route: '/exceptions', severity: ex.severity }, ...state.activity].slice(0, 20),
      }
    }
    case 'RESOLVE_EXCEPTION': {
      return { ...state, exceptions: state.exceptions.map(e => e.id === action.payload.id ? { ...e, status: 'RESOLVED', resolvedAt: new Date().toISOString(), resolution: action.payload.resolution } : e) }
    }
    case 'ADD_TOAST': {
      const toast = { id: Date.now(), ...action.payload }
      return { ...state, toasts: [...state.toasts, toast] }
    }
    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    }
    case 'SET_ROLE': {
      return { ...state, role: action.payload }
    }
    case 'SUBMIT_REQUISITION': {
      const newActivity = [{ id: Date.now(), type: 'REQUISITION', text: `Requisition ${action.payload.id} submitted`, time: new Date().toISOString(), route: '/stage2/requisition' }, ...state.activity].slice(0, 20)
      return { ...state, activity: newActivity }
    }
    case 'APPROVE_VARIANCE': {
      const { exceptionId, lotId } = action.payload
      const updatedExceptions = state.exceptions.map(e => e.id === exceptionId ? { ...e, status: 'RESOLVED', resolution: 'Variance approved by Store Manager' } : e)
      const lot = { id: lotId, material: 'Approved Item', vendor: 'Vendor', qty: 0, unit: 'KG', status: 'UNDER_QC', arrivedAt: new Date().toISOString(), stage: 1 }
      return { ...state, exceptions: updatedExceptions, lots: [...state.lots, lot] }
    }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addToast = useCallback((toast) => {
    dispatch({ type: 'ADD_TOAST', payload: toast })
  }, [])

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  return (
    <StoreContext.Provider value={{ state, dispatch, addToast, removeToast }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useKPIs() {
  const { state } = useStore()
  const today = new Date().toISOString().slice(0, 10)
  return {
    trucksToday: state.trucks.filter(t => t.id?.includes(dateStr)).length,
    grnsToday: state.lots.filter(l => l.arrivedAt?.startsWith(today)).length,
    lotsUnderQC: state.lots.filter(l => l.status === 'UNDER_QC').length,
    lotsApproved: state.lots.filter(l => l.status === 'APPROVED').length,
    exceptionsOpen: state.exceptions.filter(e => e.status === 'OPEN').length,
    inventoryItems: state.inventory.length,
  }
}
