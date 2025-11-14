import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCategoriesQuery } from "@/features/category/hooks/useCategoriesQuery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, Search } from "lucide-react"
import { useState } from "react"

export default function Category() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, isLoading, error } = useCategoriesQuery({
    search: searchTerm || undefined,
    limit: 50,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const categories = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Category Catalog</CardTitle>
          <CardDescription>
            Manage your category catalog, categories, and category information.
          </CardDescription>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load categories. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. {searchTerm && `Try adjusting your search for "${searchTerm}".`}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category: any) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.slug}</p>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground max-w-md truncate">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Pos: {category.position}</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}