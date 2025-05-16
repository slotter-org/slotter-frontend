// Create a shared utility function for permission colors
export const getColorForCategory = (category: string): string => {
  switch (category) {
    case "avatar":
      return "#3b82f6" // Blue
    case "invitations":
      return "#10b981" // Green
    case "roles":
      return "#ef4444" // Red
    default:
      return "#8b5cf6" // Purple
  }
}


export const getColorForInvitation = (status: string): string => {
  switch (status) {
    case "pending":
      return "#CA8A04"
    case "accepted":
      return "#16A34A"
    case "expired":
      return "#6B7280"
    case "canceled":
      return "#DC2626"
    case "rejected":
      return "#BE185D"
  }
}

