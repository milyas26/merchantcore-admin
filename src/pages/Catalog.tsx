import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Catalog() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catalog</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Manage your product catalog, categories, and product information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Product catalog management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}