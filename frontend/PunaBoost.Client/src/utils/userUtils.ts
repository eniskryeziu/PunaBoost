import { candidateService } from '@/services/candidateService';
import { companyService } from '@/services/companyService';
import type { User } from '@/types';

export async function enrichUserWithName(user: User): Promise<User> {
  if (user.role === 'Admin') {
    return user;
  }
  
  try {
    if (user.role === 'Candidate') {
      const currentCandidate = await candidateService.getMyProfile();
      if (currentCandidate) {
        return {
          ...user,
          firstName: currentCandidate.firstName,
          lastName: currentCandidate.lastName,
          name: `${currentCandidate.firstName} ${currentCandidate.lastName}`,
        };
      }
    } else if (user.role === 'Company') {
      const company = await companyService.getMyCompany();
      if (company) {
        return {
          ...user,
          companyName: company.companyName,
          name: company.companyName,
        };
      }
    }
  } catch (error) {
    console.error('Failed to enrich user with name:', error);
  }
  return user;
}

export function getInitials(user: User | null): string {
  if (!user) return '?';
  
  if (user.firstName && user.lastName) {
    const first = user.firstName.trim()[0]?.toUpperCase() || '';
    const last = user.lastName.trim()[0]?.toUpperCase() || '';
    if (first && last) {
      return first + last;
    }
  }
  
  if (user.name) {
    const parts = user.name.trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 2) {
      const first = parts[0][0]?.toUpperCase() || '';
      const last = parts[parts.length - 1][0]?.toUpperCase() || '';
      if (first && last) {
        return first + last;
      }
    } else if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }
  
  if (user.companyName) {
    const parts = user.companyName.trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 2) {
      const first = parts[0][0]?.toUpperCase() || '';
      const last = parts[parts.length - 1][0]?.toUpperCase() || '';
      if (first && last) {
        return first + last;
      }
    } else if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }
  
  if (user.email) {
    const emailParts = user.email.split('@')[0].split(/[._-]/).filter(p => p.length > 0);
    if (emailParts.length >= 2) {
      const first = emailParts[0][0]?.toUpperCase() || '';
      const last = emailParts[emailParts.length - 1][0]?.toUpperCase() || '';
      if (first && last) {
        return first + last;
      }
    }
  }
  
  return user.email?.charAt(0).toUpperCase() || '?';
}

