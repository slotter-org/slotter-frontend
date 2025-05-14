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

