import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store/mockStore'
import AppShell from './components/AppShell'

import Dashboard from './pages/Dashboard'
import TruckArrival from './pages/stage1/TruckArrival'
import GrnCreation from './pages/stage1/GrnCreation'
import QaInspection from './pages/stage1/QaInspection'
import PutAway from './pages/stage1/PutAway'
import Requisition from './pages/stage2/Requisition'
import Dumping from './pages/stage3/Dumping'
import PrimaryPacking from './pages/stage4/PrimaryPacking'
import Rework from './pages/stage5/Rework'
import IsaTray from './pages/stage6/IsaTray'
import SecondaryPacking from './pages/stage7/SecondaryPacking'
import FgDispatch from './pages/stage8/FgDispatch'
import Traceability from './pages/Traceability'
import Exceptions from './pages/Exceptions'
import Reports from './pages/Reports'
import MasterData from './pages/MasterData'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="stage1/truck-arrival" element={<TruckArrival />} />
            <Route path="stage1/grn/new" element={<GrnCreation />} />
            <Route path="stage1/qa-inspection" element={<QaInspection />} />
            <Route path="stage1/put-away" element={<PutAway />} />
            <Route path="stage2/requisition" element={<Requisition />} />
            <Route path="stage3/dumping" element={<Dumping />} />
            <Route path="stage4/primary-packing" element={<PrimaryPacking />} />
            <Route path="stage5/rework" element={<Rework />} />
            <Route path="stage6/isa" element={<IsaTray />} />
            <Route path="stage7/secondary-packing" element={<SecondaryPacking />} />
            <Route path="stage8/fg-dispatch" element={<FgDispatch />} />
            <Route path="traceability" element={<Traceability />} />
            <Route path="exceptions" element={<Exceptions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="master-data" element={<MasterData />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
