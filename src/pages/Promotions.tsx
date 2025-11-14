import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Promotions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Promotions</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Promotion Management</CardTitle>
          <CardDescription>
            Create and manage discounts, coupons, and promotional campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Promotion management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}