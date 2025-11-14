import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Products() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Manage your products, inventory, and pricing from this dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Product list and management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}