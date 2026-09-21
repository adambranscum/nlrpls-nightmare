import './globals.css';

export const metadata = {
  title: 'nightmare — NLRPLS IT Reference',
  description: 'Internal IT reference assistant for NLRPLS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
