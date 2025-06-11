import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Link as LinkIcon, Flag } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

interface NewsFeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsTitle: string;
  newsContent: string;
  newsUrl?: string;
}

export default function NewsFeedbackForm({ 
  open, 
  onOpenChange, 
  newsTitle, 
  newsContent,
  newsUrl 
}: NewsFeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  
  const generateDefaultMessage = () => {
    return `I would like to report concerns about the following news article:

Title: ${newsTitle}
URL: ${newsUrl || 'N/A'}

My concerns:
[Please describe your specific concerns about this article]

Additional context:
${newsContent.substring(0, 150)}...`;
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      subject: `Content Report: ${newsTitle.substring(0, 50)}${newsTitle.length > 50 ? '...' : ''}`,
      message: generateDefaultMessage(),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "e63542f7-3d7a-466c-9217-b30060624fe8",
          email: values.email,
          subject: values.subject,
          message: values.message,
          news_title: newsTitle,
          news_url: newsUrl,
          news_content: newsContent,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Feedback submitted successfully");
        onOpenChange(false);
        form.reset();
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flag className="h-5 w-5" />
            Report Content
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Your Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      type="email" 
                      className="h-12 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {newsUrl && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <LinkIcon className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={newsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline truncate hover:text-primary transition-colors"
                >
                  {newsUrl}
                </a>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Subject</FormLabel>
                  <FormControl>
                    <Input 
                      className="h-12 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Your Concerns</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="min-h-[250px] text-base p-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert className="bg-muted">
              <AlertDescription className="text-base">
                Your feedback helps us maintain news quality and accuracy.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-12 px-6 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
