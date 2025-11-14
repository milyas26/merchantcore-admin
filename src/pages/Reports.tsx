import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Reports() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Business Reports</CardTitle>
          <CardDescription>
            View sales reports, analytics, and business insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Reports and analytics features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}