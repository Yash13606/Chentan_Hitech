export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-medium text-foreground mb-4">
          Access Restricted
        </h1>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to view this page.
        </p>
        <a
          href="/"
          className="text-sm font-medium underline underline-offset-4 text-foreground"
        >
          Return to home
        </a>
      </div>
    </main>
  );
}
