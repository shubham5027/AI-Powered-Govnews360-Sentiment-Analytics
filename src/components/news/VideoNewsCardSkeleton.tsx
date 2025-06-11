
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default function VideoNewsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="shimmer h-4 w-48 mb-2 rounded-full bg-muted/50"></div>
        <div className="shimmer h-6 w-full mb-2 rounded-md bg-muted/50"></div>
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="shimmer h-6 w-20 rounded-md bg-muted/50"></div>
          <div className="shimmer h-6 w-20 rounded-md bg-muted/50"></div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-4">
          <AspectRatio ratio={16 / 9}>
            <div className="rounded-md w-full h-full shimmer bg-muted/50"></div>
          </AspectRatio>
        </div>
        
        <div className="shimmer h-4 w-24 mb-2 rounded-md bg-muted/50"></div>
        <div className="space-y-2">
          <div className="shimmer h-3 w-full rounded-md bg-muted/50"></div>
          <div className="shimmer h-3 w-full rounded-md bg-muted/50"></div>
          <div className="shimmer h-3 w-3/4 rounded-md bg-muted/50"></div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
        <div className="shimmer h-8 w-20 rounded-md bg-muted/50"></div>
        <div className="shimmer h-8 w-20 rounded-md bg-muted/50"></div>
      </CardFooter>
    </Card>
  );
}
