import type { Metadata } from 'next';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Grupo Greentech | Energia Solar & Mobilidade Elétrica',
  description:
    'Instalação de sistemas solares e infraestrutura de carregamento de veículos elétricos. Greentech Charge: soluções inteligentes de recarga veicular para residências e condomínios.',
  keywords: ['energia solar', 'carregador veicular', 'mobilidade elétrica', 'Grupo Greentech', 'Greentech Charge', 'painel solar', 'wallbox', 'carport solar'],
  authors: [{ name: 'Grupo Greentech' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
