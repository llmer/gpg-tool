import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Github, FileKey, X, Key } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { encryptFile } from '@/lib/encryption';
import { cn } from '@/lib/utils';
import { fetchPublicKey, type RecipientSource } from '@/lib/keys-source';

interface Recipient {
  source: RecipientSource;
  publicKey: string;
}

const formSchema = z.object({
  provider: z.enum(['github', 'openpgp']),
  identifier: z.string().min(1, 'Identifier is required'),
});

export function FileEncryptor() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'github',
      identifier: '',
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubUser = params.get('github');
    const openpgpKey = params.get('key');
    
    if (githubUser?.trim()) {
      addRecipient({ provider: 'github', identifier: githubUser });
    }
    if (openpgpKey?.trim()) {
      addRecipient({ provider: 'openpgp', identifier: openpgpKey });
    }
  }, []);

  const addRecipient = async (source: RecipientSource) => {
    try {
      if (recipients.some(r => 
        r.source.provider === source.provider && 
        r.source.identifier === source.identifier
      )) {
        toast({
          title: 'Recipient already added',
          description: 'This recipient is already in the list',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      const publicKey = await fetchPublicKey(source);
      
      setRecipients(prev => [...prev, { source, publicKey }]);
      form.reset();
      
      toast({
        title: 'Recipient added',
        description: `Added recipient from ${source.provider}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add recipient';
      toast({
        title: 'Failed to add recipient',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addRecipient(values);
  };

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
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
        description: 'Please add at least one recipient',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsEncrypting(true);
      setProgress(20);
      
      const publicKeys = recipients.map(r => r.publicKey);
      
      setProgress(50);
      
      const { encrypted, filename } = await encryptFile(file, publicKeys);
      
      setProgress(80);

      const blob = new Blob([encrypted], { type: 'application/gpg-encrypted' });
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

  const getIdentifierPlaceholder = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'GitHub username';
      case 'openpgp':
        return '40-char fingerprint, 16-char key ID, or email';
      default:
        return '';
    }
  };

  const getIdentifierDescription = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'Enter a GitHub username';
      case 'openpgp':
        return 'Enter a fingerprint, key ID, or email address';
      default:
        return '';
    }
  };

  return (
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Encrypt File</h2>
          <p className="text-sm text-muted-foreground">
            Select a file and add recipients to encrypt your file with GPG.
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
              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || isEncrypting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a key source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="github">
                            <div className="flex items-center space-x-2">
                              <Github className="w-4 h-4" />
                              <span>GitHub</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="openpgp">
                            <div className="flex items-center space-x-2">
                              <Key className="w-4 h-4" />
                              <span>OpenPGP.org</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifier</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder={getIdentifierPlaceholder(form.watch('provider'))}
                            {...field}
                            disabled={isLoading || isEncrypting}
                            className="bg-muted/50"
                          />
                          <Button 
                            type="submit" 
                            variant="secondary"
                            disabled={isLoading || isEncrypting}
                          >
                            {isLoading ? 'Adding...' : 'Add'}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {getIdentifierDescription(form.watch('provider'))}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-primary/10 text-sm"
                >
                  {recipient.source.provider === 'github' ? (
                    <Github className="w-3 h-3" />
                  ) : (
                    <Key className="w-3 h-3" />
                  )}
                  <span>{recipient.source.identifier}</span>
                  <button
                    onClick={() => removeRecipient(index)}
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