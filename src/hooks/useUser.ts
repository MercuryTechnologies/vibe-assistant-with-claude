import { useState, useEffect } from 'react';
import type { User, TeamMember } from '@/types';
import usersData from '@/data/users.json';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      setUser(usersData.user as User);
      setTeamMembers(usersData.teamMembers as TeamMember[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`
    : '';

  return {
    user,
    teamMembers,
    fullName,
    initials,
    isLoading,
  };
}

