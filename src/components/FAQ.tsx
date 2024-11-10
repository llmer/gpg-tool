import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  KeyRound, 
  FileKey, 
  PenTool, 
  ShieldCheck, 
  HelpCircle,
  AlertTriangle,
  Github,
  Key,
  Info
} from 'lucide-react';

const faqSections = [
  {
    id: "basics",
    icon: Info,
    title: "Basic Concepts",
    items: [
      {
        question: "What's the difference between PGP and GPG?",
        answer: `
          PGP (Pretty Good Privacy) and GPG (GNU Privacy Guard) are essentially the same thing:
          
          - PGP was the original software created in 1991
          - GPG is the free, open-source implementation of PGP
          - Both use the same encryption standards
          - The terms are often used interchangeably
          
          This tool uses GPG (GNU Privacy Guard) for all encryption operations.
        `
      }
    ]
  },
  {
    id: "keys",
    icon: KeyRound,
    title: "Managing GPG Keys",
    items: [
      {
        question: "How do I generate a new GPG key?",
        answer: `
          1. Go to the "Key Manager" tab
          2. Click "Generate New Keys"
          3. Fill in your name, email, and a secure passphrase
          4. Click "Generate" to create your key pair
          5. Your keys will be securely stored in your browser
          
          Remember to backup your keys by using the export function!
        `
      },
      {
        question: "How do I import existing GPG keys?",
        answer: `
          1. Go to the "Key Manager" tab
          2. Click "Import Keys"
          3. Select your GPG key file (.json format)
          4. Your keys will be imported and stored securely
          
          Note: Only keys exported from this tool in .json format are supported.
        `
      },
      {
        question: "Why should I backup my GPG keys?",
        answer: `
          Backing up your keys is crucial because:
          - Browser data can be cleared accidentally
          - You might need to use the keys on another device
          - Keys cannot be recovered if lost
          
          Use the export function in the Key Manager to save your keys safely.
        `
      }
    ]
  },
  {
    id: "encryption",
    icon: FileKey,
    title: "File Encryption",
    items: [
      {
        question: "How do I encrypt a file?",
        answer: `
          1. Go to the "File Encryptor" tab
          2. Click to select or drag & drop your file
          3. Choose a key source (GitHub or OpenPGP.org)
          4. Add recipients using their identifiers
          5. Click "Encrypt File"
          6. Download the encrypted .gpg file
          
          Recipients must have public GPG keys available through the chosen source.
        `
      },
      {
        question: "What are the different key sources?",
        answer: `
          GitHub:
          - Enter a GitHub username
          - The user must have GPG keys on their GitHub profile
          
          OpenPGP.org:
          - Enter a 40-character fingerprint
          - Enter a 16-character key ID
          - Enter an email address
          
          The format is automatically detected based on your input.
        `
      },
      {
        question: "Who can decrypt my encrypted files?",
        answer: `
          Only recipients you select can decrypt the files.
          Each recipient must:
          - Have a valid GPG public key
          - Have been added as a recipient during encryption
          - Have access to their private key to decrypt
        `
      }
    ]
  },
  {
    id: "signing",
    icon: PenTool,
    title: "Message Signing",
    items: [
      {
        question: "How do I sign a message?",
        answer: `
          1. Go to the "Message Signing" tab
          2. Enter your message in the text area
          3. Enter your key passphrase
          4. Click "Sign Message"
          5. Copy the signed message output
          
          The signature proves the message came from you.
        `
      },
      {
        question: "How can others verify my signed messages?",
        answer: `
          Recipients can verify your signed messages by:
          1. Going to the "Message Signing" tab
          2. Pasting the signed message
          3. Clicking "Verify Signature"
          
          They must have your public key to verify the signature.
        `
      }
    ]
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "Privacy & Security",
    items: [
      {
        question: "Is my data secure?",
        answer: `
          Yes! This tool prioritizes your privacy:
          - All encryption happens locally in your browser
          - No data is sent to external servers
          - Keys are stored encrypted in your browser
          - Network activity is monitored and displayed
        `
      },
      {
        question: "What data does the Privacy Monitor track?",
        answer: `
          The Privacy Monitor shows:
          - Domain names of network requests
          - Number of packets sent/received
          - Timeline of network activity
          
          This helps you verify that data stays local.
        `
      }
    ]
  },
  {
    id: "troubleshooting",
    icon: AlertTriangle,
    title: "Troubleshooting",
    items: [
      {
        question: "Unable to retrieve key from GitHub",
        answer: `
          This usually happens when:
          1. The GitHub username is incorrect
          2. The user hasn't published any GPG keys
          3. GitHub's API rate limit is exceeded
          
          Solutions:
          - Verify the GitHub username
          - Ask the user to publish their GPG key
          - Wait a few minutes if rate limited
        `
      },
      {
        question: "Unable to retrieve key from OpenPGP.org",
        answer: `
          Common issues:
          1. Invalid format
             - Fingerprint must be 40 hex characters
             - Key ID must be 16 hex characters
             - Email must be valid format
          2. Key not found
             - Verify the identifier is correct
             - Check if key exists on OpenPGP.org
          3. Rate limit exceeded
             - Wait a minute before trying again
          
          For email searches:
          - Only exact matches are returned
          - Email must be verified on OpenPGP.org
        `
      },
      {
        question: "Encryption process failed",
        answer: `
          Common causes and solutions:
          1. File too large
             - Try splitting into smaller files
          2. Invalid recipient key
             - Verify the key source and identifier
             - Check if the key is valid
          3. Browser storage full
             - Clear some browser data
             - Try in private/incognito mode
        `
      }
    ]
  }
];

export function FAQ() {
  return (
    <Card className="w-full backdrop-blur-sm bg-card/50 border-border/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Find answers to common questions about using the GPG Tool.
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-15rem)] pr-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqSections.map((section) => (
                <AccordionItem 
                  key={section.id} 
                  value={section.id}
                  className="bg-muted/50 rounded-lg px-4 border-border/20"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center space-x-2">
                      <section.icon className="w-4 h-4 text-primary" />
                      <span>{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-1">
                    <div className="space-y-4">
                      {section.items.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-sm">{item.question}</h3>
                          <div className="text-sm text-muted-foreground whitespace-pre-line">
                            {item.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}