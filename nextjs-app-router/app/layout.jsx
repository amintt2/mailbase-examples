export const metadata = { title: "Mailbase + Next.js" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "64px auto", padding: "0 16px" }}>
        {children}
      </body>
    </html>
  );
}
