import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PenTool, CheckCircle, Copy, FileCheck } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { signMessage, verifyMessage } from '@/lib/signing';
import { loadKeyPair } from '@/lib/keys';

const signSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  passphrase: z.string().min(1, 'Passphrase is required'),
});

const verifySchema = z.object({
  signedMessage: z.string().min(1, 'Signed message is required'),
});

export function MessageSigner() {
  const [signedMessage, setSignedMessage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const { toast } = useToast();
  const keyPair = loadKeyPair();

  const signForm = useForm<z.infer<typeof signSchema>>({
    resolver: zodResolver(signSchema),
    defaultValues: {
      message: '',
      passphrase: '',
    },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      signedMessage: '',
    },
  });

  const onSign = async (values: z.infer<typeof signSchema>) => {
    try {
      if (!keyPair) {
        throw new Error('No GPG key pair found');
      }

      const signed = await signMessage(
        values.message,
        keyPair.privateKey,
        values.passphrase
      );

      setSignedMessage(signed);
      signForm.reset();

      toast({
        title: 'Message signed successfully',
        description: 'Your message has been signed with your private key.',
      });
    } catch (error) {
      toast({
        title: 'Signing failed',
        description: error instanceof Error ? error.message : 'Failed to sign message',
        variant: 'destructive',
      });
    }
  };

  const onVerify = async (values: z.infer<typeof verifySchema>) => {
    try {
      if (!keyPair) {
        throw new Error('No GPG key pair found');
      }

      const result = await verifyMessage(
        values.signedMessage,
        keyPair.publicKey
      );

      setVerificationResult(result);

      toast({
        title: result.valid ? 'Signature valid' : 'Signature invalid',
        description: result.valid 
          ? 'The message signature is valid and trusted.'
          : 'The message signature could not be verified.',
        variant: result.valid ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Failed to verify message',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'The signed message has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  if (!keyPair) {
    return (
      <CardContent className="p-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Please generate or import a GPG key pair to use message signing.
          </p>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Message Signing</h2>
          <p className="text-sm text-muted-foreground">
            Sign messages with your private key to prove authenticity.
          </p>
        </div>

        <div className="space-y-4">
          <Form {...signForm}>
            <form onSubmit={signForm.handleSubmit(onSign)} className="space-y-4">
              <FormField
                control={signForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your message..."
                        className="min-h-[100px] bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signForm.control}
                name="passphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Passphrase</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your key passphrase"
                        className="bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <PenTool className="w-4 h-4 mr-2" />
                Sign Message
              </Button>
            </form>
          </Form>

          {signedMessage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Signed Message</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(signedMessage)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted/50 text-xs overflow-auto">
                {signedMessage}
              </pre>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Verify
              </span>
            </div>
          </div>

          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
              <FormField
                control={verifyForm.control}
                name="signedMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signed Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste a signed message to verify..."
                        className="min-h-[100px] bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="secondary" className="w-full">
                <FileCheck className="w-4 h-4 mr-2" />
                Verify Signature
              </Button>
            </form>
          </Form>

          {verificationResult && (
            <div className={`p-4 rounded-lg ${
              verificationResult.valid 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-red-500/10 text-red-500'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {verificationResult.valid ? 'Valid signature' : 'Invalid signature'}
                </span>
              </div>
              {verificationResult.valid && (
                <p className="mt-2 text-sm">
                  Original message: {verificationResult.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
}