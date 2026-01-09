import { useUser } from '@/hooks';

export function Dashboard() {
  const { user, isLoading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-body text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-[24px]">
      <h1 className="text-title-main">
        Welcome back, {user?.firstName}
      </h1>
    </div>
  );
}

