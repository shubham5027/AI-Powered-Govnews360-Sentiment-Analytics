
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="shimmer h-4 w-32 mb-2 rounded-full bg-muted/50"></div>
        <div className="shimmer h-6 w-full mb-2 rounded-md bg-muted/50"></div>
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="shimmer h-6 w-20 rounded-md bg-muted/50"></div>
          <div className="shimmer h-6 w-20 rounded-md bg-muted/50"></div>
          <div className="shimmer h-6 w-12 rounded-md bg-muted/50"></div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="shimmer h-4 w-full rounded-md bg-muted/50"></div>
          <div className="shimmer h-4 w-full rounded-md bg-muted/50"></div>
          <div className="shimmer h-4 w-3/4 rounded-md bg-muted/50"></div>
          <div className="shimmer h-4 w-5/6 rounded-md bg-muted/50"></div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="shimmer h-8 w-20 rounded-md bg-muted/50"></div>
          <div className="shimmer h-8 w-24 rounded-md bg-muted/50"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="shimmer h-8 w-16 rounded-md bg-muted/50"></div>
          <div className="shimmer h-8 w-20 rounded-md bg-muted/50"></div>
        </div>
      </CardFooter>
    </Card>
  );
}
