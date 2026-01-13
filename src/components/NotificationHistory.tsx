import { useAppStore } from '@/stores/useAppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow, subHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell } from 'lucide-react'

interface NotificationHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationHistory({
  open,
  onOpenChange,
}: NotificationHistoryProps) {
  const { notifications } = useAppStore()

  // Filter for last 16 hours
  const cutoff = subHours(new Date(), 16)
  const recentNotifications = notifications.filter(
    (n) => new Date(n.date) > cutoff,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="aero-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Histórico (16h)
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] mt-2">
          {recentNotifications.length > 0 ? (
            <div className="space-y-3">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma notificação recente.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
