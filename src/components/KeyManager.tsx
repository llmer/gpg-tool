import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { generateKeyPair, importKeyPair, saveKeyPair, loadKeyPair, removeKeyPair, type KeyPair } from '@/lib/keys';

const generateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  passphrase: z.string().min(8, 'Passphrase must be at least 8 characters'),
});

export function KeyManager() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(loadKeyPair());
  const { toast } = useToast();

  const form = useForm<z.infer<typeof generateSchema>>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      name: '',
      email: '',
      passphrase: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof generateSchema>) => {
    try {
      const newKeyPair = await generateKeyPair(
        values.name,
        values.email,
        values.passphrase
      );
      saveKeyPair(newKeyPair);
      setKeyPair(newKeyPair);
      form.reset();
      toast({
        title: 'Keys generated successfully',
        description: 'Your GPG keys have been generated and saved securely.',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate keys',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      const newKeyPair = await importKeyPair(imported.publicKey, imported.privateKey);
      saveKeyPair(newKeyPair);
      setKeyPair(newKeyPair);
      toast({
        title: 'Keys imported successfully',
        description: 'Your GPG keys have been imported and saved.',
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import keys. Please check the file format.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    if (!keyPair) return;

    const blob = new Blob([JSON.stringify(keyPair, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gpg-keypair.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRemove = () => {
    removeKeyPair();
    setKeyPair(null);
    toast({
      title: 'Keys removed',
      description: 'Your GPG keys have been removed from local storage.',
    });
  };

  return (
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Manage Keys</h2>
          <p className="text-sm text-muted-foreground">
            Generate or import your GPG keys for file encryption.
          </p>
        </div>

        {!keyPair ? (
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-primary/90 hover:bg-primary">
                  Generate New Keys
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate GPG Keys</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="passphrase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passphrase</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Generate
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/50 px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <label className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import Keys</span>
                <Input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImport}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                className="hover:bg-primary/10"
                title="Export keys"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="hover:bg-destructive/10 hover:text-destructive"
                title="Remove keys"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-muted/20">
              <p className="text-sm font-mono break-all text-muted-foreground">
                Fingerprint: {keyPair.fingerprint}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your GPG keys are securely stored in your browser.
              Make sure to export and backup your keys!
            </p>
          </div>
        )}
      </div>
    </CardContent>
  );
}