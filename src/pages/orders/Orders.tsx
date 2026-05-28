import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Orders() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage customer orders, track shipments, and process returns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Order list and management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}