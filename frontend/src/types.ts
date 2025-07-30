export interface TeamMember {
  id: string;
  name: string;
  picture: string;
  email: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  members: TeamMember[];
}

export interface Feedback {
  id: string;
  content: string;
  targetType: 'team' | 'member';
  targetId: string;
  targetName: string;
  createdAt: Date;
}