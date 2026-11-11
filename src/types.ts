export type GroupId = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6';

export type CaseId = '1' | '2' | '3' | '4' | '5';

export interface GroupMeta {
  id: GroupId;
  name: string;
  roleTitle: string;
  badgeColor: string;
  borderClass: string;
  bgGlowClass: string;
  iconName: string;
  description: string;
  agencyRole: 'Prinsipal' | 'Agen Utama' | 'Pengawas / Manajer' | 'Agen Operasional';
}

export interface DecisionData {
  title: string;
  content: string;
  timestamp: string;
  author: string;
  submittedAt?: number;
  scores?: {
    total: number;
    goalCongruence: number;
    infoTransparency: number;
    agencyMitigation: number;
    strategicDepth: number;
  };
}

export interface StudentProfile {
  name: string;
  pin: string;
  group: GroupId;
  registeredAt: string;
}

export interface CaseData {
  id: CaseId;
  title: string;
  desc: string;
  triggerTeam: GroupId;
  triggerRoleName: string;
  keyConcepts: string[];
  instructions: {
    [key in GroupId]?: string;
  } & {
    default: string;
  };
  gmGuide: {
    trigger: string;
    summary: string;
    learningGoal: string;
    groupTasks: {
      group: GroupId;
      name: string;
      task: string;
    }[];
  };
}

export interface ClassData {
  activeCase: CaseId;
  timerRunning: boolean;
  absoluteStartTime: number | null;
  accumulatedPausedTime: number;
  decisions: {
    [key in GroupId]?: DecisionData;
  };
  studentProfiles: {
    [profileKey: string]: StudentProfile;
  };
  gmNotes?: string;
  updatedAt?: number;
}

export interface UserSession {
  role: 'student' | 'gm';
  kelas: string;
  group?: GroupId;
  name: string;
}

export interface TimerComputation {
  globalTimer: number; // in seconds (max 3600)
  triggerTimer: number; // in seconds (max 1800)
}
