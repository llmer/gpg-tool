import { ThemeProvider } from '@/components/ThemeProvider';
import { FileEncryptor } from '@/components/FileEncryptor';
import { KeyManager } from '@/components/KeyManager';
import { MessageSigner } from '@/components/MessageSigner';
import { SystemMonitor } from '@/components/SystemMonitor';
import { Toaster } from '@/components/ui/toaster';
import { Github, ShieldEllipsis } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { loadKeyPair } from '@/lib/keys';

export function App() {
  const keyPair = loadKeyPair();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex flex-col">
        <header className="w-full p-4 backdrop-blur-sm border-b border-border/20 sticky top-0 z-50">
          <div className="container max-w-7xl mx-auto flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldEllipsis className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                GPG Tool
              </h1>
            </div>
            <a
              href="https://github.com/llmer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </header>

        <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
          <Card className="w-full backdrop-blur-sm bg-card/50 border-border/20">
            <Tabs defaultValue="encrypt" className="w-full">
              <TabsList className="w-full grid grid-cols-3 sticky top-[73px] z-10 bg-background/50 backdrop-blur-sm rounded-t-lg">
                <TabsTrigger 
                  value="encrypt" 
                  className="relative py-3 data-[state=active]:bg-background/50 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:rounded-none transition-colors group border-b border-border/20"
                >
                  <span className="relative z-10 font-medium">File Encryptor</span>
                  <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-primary/80 via-primary to-primary/80 scale-x-0 transition-transform duration-200 group-data-[state=active]:scale-x-100" />
                </TabsTrigger>
                <TabsTrigger 
                  value="keys"
                  className="relative py-3 data-[state=active]:bg-background/50 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:rounded-none transition-colors group border-b border-border/20"
                >
                  <span className="relative z-10 font-medium">Key Manager</span>
                  <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-primary/80 via-primary to-primary/80 scale-x-0 transition-transform duration-200 group-data-[state=active]:scale-x-100" />
                </TabsTrigger>
                <TabsTrigger 
                  value="sign"
                  className="relative py-3 data-[state=active]:bg-background/50 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:rounded-none transition-colors group border-b border-border/20"
                  disabled={!keyPair}
                  title={!keyPair ? "Generate or import a key pair to enable message signing" : undefined}
                >
                  <span className="relative z-10 font-medium">Message Signing</span>
                  <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-primary/80 via-primary to-primary/80 scale-x-0 transition-transform duration-200 group-data-[state=active]:scale-x-100" />
                </TabsTrigger>
              </TabsList>
              <TabsContent value="encrypt" className="mt-0">
                <FileEncryptor />
              </TabsContent>
              <TabsContent value="keys" className="mt-0">
                <KeyManager />
              </TabsContent>
              <TabsContent value="sign" className="mt-0">
                <MessageSigner />
              </TabsContent>
            </Tabs>
          </Card>
        </main>

        <SystemMonitor />

        <footer className="w-full p-4 text-center text-sm text-muted-foreground backdrop-blur-sm border-t border-border/20">
          <p>Encrypt files locally in your browser with ease. Download, secure, and share with confidence.</p>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;