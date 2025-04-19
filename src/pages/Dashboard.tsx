// frontend/src/pages/Dashboard.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from '@/components/common/DateRangePicker'

export function Dashboard() {
  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <DateRangePicker />
      </div>
      <Tabs defaultValue="overview" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

