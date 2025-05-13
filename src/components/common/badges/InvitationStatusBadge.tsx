import type React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  `inline-flex items-center justify-center rounded-full px-3 py-1
   text-xs font-semibold transition-colors focus:outline-none
   focus:ring-2 focus:ring-ring focus:ring-offset-2 w-24 h-7`,
  {
    variants: {
      variant: {
        pending: 'bg-amber-100 text-amber-800 border border-amber-200',
        accepted: 'bg-green-100 text-green-800 border border-green-200',
        rejected: 'bg-red-100 text-red-800 border border-red-200',
        expired: 'bg-gray-100 text-gray-800 border border-gray-200',
        canceled: 'bg-purple-100 text-purple-800 border border-purple-200',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  },
)

export interface InvitationStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'canceled'
}

export function InvitationStatusBadge({ className, status, ...props }: InvitationStatusBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant: status }), className)} {...props}>
      <div className="flex items-center justify-center w-full">
        <span className="flex items-center justify-center">
          {status === 'pending' && <Clock className="mr-1.5 h-3 w-3 flex-shrink-0" />}
          {status === 'accepted' && <CheckCircle2 className="mr-1.5 h-3 w-3 flex-shrink-0" />}
          {status === 'rejected' && <XCircle className="mr-1.5 h-3 w-3 flex-shrink-0" />}
          {status === 'expired' && <AlertCircle className="mr-1.5 h-3 w-3 flex-shrink-0" />}
          {status === 'canceled' && <Ban className="mr-1.5 h-3 w-3 flex-shrink-0" />}
          <span className="capitalize">{status}</span>
        </span>
      </div>
    </div>
  )
}
