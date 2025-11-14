import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Inventory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Track stock levels, manage warehouses, and monitor inventory movements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Inventory management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}