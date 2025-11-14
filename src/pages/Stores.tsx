import { StoreList } from "@/features/stores"

export default function Stores() {
  const handleStoreSelect = (storeId: string) => {
    console.log("Selected store:", storeId)
    // Handle store selection if needed
  }

  return (
    <div className="container">
      <StoreList onStoreSelect={handleStoreSelect} />
    </div>
  )
}