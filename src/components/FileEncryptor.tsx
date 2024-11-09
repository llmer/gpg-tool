import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Github, FileKey, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { fetchGitHubGPGKeys } from '@/lib/github';
import { encryptFile } from '@/lib/encryption';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  username: z.string().min(1, 'GitHub username is required'),
});

interface Recipient {
  username: string;
  publicKey: string;
}

export function FileEncryptor() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  // Handle URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubUser = params.get('github');
    
    if (githubUser) {
      // Auto-add the GitHub user from the URL
      const addGithubUser = async () => {
        try {
          const keys = await fetchGitHubGPGKeys(githubUser);
          setRecipients([{ username: githubUser, publicKey: keys[0] }]);
          
          toast({
            title: 'Recipient added',
            description: `${githubUser} added from URL parameter`,
          });
        } catch (error) {
          toast({
            title: 'Failed to add recipient',
            description: error instanceof Error ? error.message : 'Failed to verify GitHub user',
            variant: 'destructive',
          });
        }
      };
      
      addGithubUser();
    }
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Check if user already added
      if (recipients.some(r => r.username === values.username)) {
        toast({
          title: 'User already added',
          description: 'This GitHub user is already in the recipients list',
          variant: 'destructive',
        });
        return;
      }

      // Fetch user's GPG keys
      const keys = await fetchGitHubGPGKeys(values.username);
      
      setRecipients([...recipients, { username: values.username, publicKey: keys[0] }]);
      form.reset();
      
      toast({
        title: 'Recipient added',
        description: `${values.username} added to recipients list`,
      });
    } catch (error) {
      toast({
        title: 'Failed to add recipient',
        description: error instanceof Error ? error.message : 'Failed to verify GitHub user',
        variant: 'destructive',
      });
    }
  };

  const removeRecipient = (username: string) => {
    setRecipients(recipients.filter(r => r.username !== username));
  };

  const handleEncrypt = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to encrypt',
        variant: 'destructive',
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        title: 'No recipients',
        description: 'Please add at least one GitHub user as recipient',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsEncrypting(true);
      setProgress(20);
      
      // Get all public keys
      const publicKeys = recipients.map(r => r.publicKey);
      
      setProgress(50);
      
      // Encrypt the file for all recipients
      const { encrypted, filename } = await encryptFile(file, publicKeys);
      
      setProgress(80);

      // Download the encrypted file
      const blob = new Blob([encrypted], { type: 'application/pgp-encrypted' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast({
        title: 'Encryption successful',
        description: 'Your file has been encrypted and downloaded',
      });

      setFile(null);
    } catch (error) {
      console.error('Encryption process failed:', error);
      toast({
        title: 'Encryption failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsEncrypting(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: 'File selected',
        description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
      });
    }
  };

  return (
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Encrypt File</h2>
          <p className="text-sm text-muted-foreground">
            Select a file and add GitHub users as recipients to encrypt your file.
          </p>
        </div>

        <div
          className={cn(
            "flex justify-center items-center p-8 border-2 border-dashed rounded-lg",
            "hover:border-primary hover:bg-primary/5 transition-colors",
            "group cursor-pointer"
          )}
        >
          <label className="flex flex-col items-center space-y-2 cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-center text-muted-foreground group-hover:text-primary transition-colors">
              {file ? file.name : 'Click to select file'}
            </span>
            <Input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isEncrypting}
            />
          </label>
        </div>

        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Github className="w-4 h-4" />
                      <span>Add GitHub Recipients</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="octocat"
                          {...field}
                          disabled={isEncrypting}
                          className="bg-muted/50"
                        />
                        <Button 
                          type="submit" 
                          variant="secondary"
                          disabled={isEncrypting}
                        >
                          Add
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient) => (
                <div
                  key={recipient.username}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-primary/10 text-sm"
                >
                  <span>{recipient.username}</span>
                  <button
                    onClick={() => removeRecipient(recipient.username)}
                    className="p-1 hover:text-destructive transition-colors"
                    disabled={isEncrypting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleEncrypt}
            className="w-full bg-primary/90 hover:bg-primary"
            disabled={isEncrypting || !file || recipients.length === 0}
          >
            <FileKey className="w-4 h-4 mr-2" />
            {isEncrypting ? 'Encrypting...' : 'Encrypt File'}
          </Button>
        </div>

        {isEncrypting && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Encrypting your file...
            </p>
          </div>
        )}
      </div>
    </CardContent>
  );
}