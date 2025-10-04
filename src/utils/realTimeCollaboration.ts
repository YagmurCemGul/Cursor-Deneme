import { SavedJobDescription } from '../types';

/**
 * Real-Time Collaboration
 * Enable multiple users to edit job descriptions simultaneously
 */

export interface CollaborationSession {
  id: string;
  descriptionId: string;
  participants: Participant[];
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursorPosition?: number;
  selection?: { start: number; end: number };
  isActive: boolean;
  joinedAt: string;
  lastSeen: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface CollaborativeEdit {
  id: string;
  sessionId: string;
  userId: string;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  timestamp: string;
  version: number;
}

export interface Comment {
  id: string;
  descriptionId: string;
  userId: string;
  userName: string;
  content: string;
  position: number;
  resolved: boolean;
  createdAt: string;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ChangeHistory {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  action: 'edit' | 'comment' | 'resolve' | 'join' | 'leave';
  details: string;
  timestamp: string;
}

/**
 * Create collaboration session
 */
export function createCollaborationSession(
  descriptionId: string,
  owner: Participant
): CollaborationSession {
  return {
    id: crypto.randomUUID(),
    descriptionId,
    participants: [owner],
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true,
  };
}

/**
 * Generate participant color
 */
export function generateParticipantColor(index: number): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];
  
  return colors[index % colors.length];
}

/**
 * Add participant to session
 */
export function addParticipant(
  session: CollaborationSession,
  participant: Omit<Participant, 'color' | 'isActive' | 'joinedAt' | 'lastSeen'>
): CollaborationSession {
  const newParticipant: Participant = {
    ...participant,
    color: generateParticipantColor(session.participants.length),
    isActive: true,
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };

  return {
    ...session,
    participants: [...session.participants, newParticipant],
    lastActivity: new Date().toISOString(),
  };
}

/**
 * Remove participant from session
 */
export function removeParticipant(
  session: CollaborationSession,
  participantId: string
): CollaborationSession {
  return {
    ...session,
    participants: session.participants.filter(p => p.id !== participantId),
    lastActivity: new Date().toISOString(),
  };
}

/**
 * Update participant cursor position
 */
export function updateParticipantCursor(
  session: CollaborationSession,
  participantId: string,
  position: number,
  selection?: { start: number; end: number }
): CollaborationSession {
  return {
    ...session,
    participants: session.participants.map(p =>
      p.id === participantId
        ? { ...p, cursorPosition: position, selection, lastSeen: new Date().toISOString() }
        : p
    ),
    lastActivity: new Date().toISOString(),
  };
}

/**
 * Apply collaborative edit using Operational Transformation (OT)
 */
export function applyCollaborativeEdit(
  text: string,
  edit: CollaborativeEdit,
  pendingEdits: CollaborativeEdit[]
): { result: string; transformedEdit: CollaborativeEdit } {
  let transformedEdit = { ...edit };

  // Transform against pending edits
  pendingEdits.forEach(pendingEdit => {
    if (pendingEdit.timestamp < edit.timestamp) {
      transformedEdit = transformEdit(transformedEdit, pendingEdit);
    }
  });

  // Apply the transformed edit
  let result = text;
  
  switch (transformedEdit.operation) {
    case 'insert':
      result = 
        text.substring(0, transformedEdit.position) +
        transformedEdit.content +
        text.substring(transformedEdit.position);
      break;
      
    case 'delete':
      const deleteLength = parseInt(transformedEdit.content) || 1;
      result = 
        text.substring(0, transformedEdit.position) +
        text.substring(transformedEdit.position + deleteLength);
      break;
      
    case 'replace':
      const replaceLength = transformedEdit.content.length;
      result = 
        text.substring(0, transformedEdit.position) +
        transformedEdit.content +
        text.substring(transformedEdit.position + replaceLength);
      break;
  }

  return { result, transformedEdit };
}

/**
 * Transform an edit against another edit (Operational Transformation)
 */
function transformEdit(
  edit: CollaborativeEdit,
  againstEdit: CollaborativeEdit
): CollaborativeEdit {
  const transformed = { ...edit };

  if (againstEdit.operation === 'insert') {
    // If insert happened before our position, shift our position
    if (againstEdit.position <= edit.position) {
      transformed.position += againstEdit.content.length;
    }
  } else if (againstEdit.operation === 'delete') {
    const deleteLength = parseInt(againstEdit.content) || 1;
    
    if (againstEdit.position < edit.position) {
      // Delete happened before our position
      if (againstEdit.position + deleteLength <= edit.position) {
        // Delete is completely before our position
        transformed.position -= deleteLength;
      } else {
        // Delete overlaps or contains our position
        transformed.position = againstEdit.position;
      }
    }
  }

  return transformed;
}

/**
 * Create comment on description
 */
export function createComment(
  descriptionId: string,
  userId: string,
  userName: string,
  content: string,
  position: number
): Comment {
  return {
    id: crypto.randomUUID(),
    descriptionId,
    userId,
    userName,
    content,
    position,
    resolved: false,
    createdAt: new Date().toISOString(),
    replies: [],
  };
}

/**
 * Add reply to comment
 */
export function addCommentReply(
  comment: Comment,
  userId: string,
  userName: string,
  content: string
): Comment {
  const reply: CommentReply = {
    id: crypto.randomUUID(),
    userId,
    userName,
    content,
    createdAt: new Date().toISOString(),
  };

  return {
    ...comment,
    replies: [...comment.replies, reply],
  };
}

/**
 * Resolve comment
 */
export function resolveComment(comment: Comment): Comment {
  return {
    ...comment,
    resolved: true,
  };
}

/**
 * Get active participants
 */
export function getActiveParticipants(
  session: CollaborationSession,
  inactiveThreshold: number = 300000 // 5 minutes
): Participant[] {
  const now = new Date().getTime();
  
  return session.participants.filter(p => {
    const lastSeen = new Date(p.lastSeen).getTime();
    return now - lastSeen < inactiveThreshold && p.isActive;
  });
}

/**
 * Generate presence indicator HTML
 */
export function generatePresenceIndicators(
  participants: Participant[],
  maxVisible: number = 5
): string {
  const visible = participants.slice(0, maxVisible);
  const remaining = Math.max(0, participants.length - maxVisible);

  const indicators = visible.map(p => `
    <div class="presence-indicator" style="background-color: ${p.color}" title="${p.name}">
      ${p.avatar ? `<img src="${p.avatar}" alt="${p.name}" />` : p.name.charAt(0)}
    </div>
  `).join('');

  const more = remaining > 0 ? `
    <div class="presence-indicator more" title="${remaining} more">
      +${remaining}
    </div>
  ` : '';

  return indicators + more;
}

/**
 * Detect conflicts in collaborative edits
 */
export function detectConflicts(
  edits: CollaborativeEdit[],
  windowMs: number = 1000
): CollaborativeEdit[][] {
  const conflicts: CollaborativeEdit[][] = [];
  const sorted = [...edits].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (let i = 0; i < sorted.length; i++) {
    const edit1 = sorted[i];
    const conflictGroup: CollaborativeEdit[] = [edit1];

    for (let j = i + 1; j < sorted.length; j++) {
      const edit2 = sorted[j];
      const timeDiff = new Date(edit2.timestamp).getTime() - new Date(edit1.timestamp).getTime();

      if (timeDiff > windowMs) break;

      // Check if positions overlap
      if (editsOverlap(edit1, edit2)) {
        conflictGroup.push(edit2);
      }
    }

    if (conflictGroup.length > 1) {
      conflicts.push(conflictGroup);
    }
  }

  return conflicts;
}

/**
 * Check if two edits overlap
 */
function editsOverlap(edit1: CollaborativeEdit, edit2: CollaborativeEdit): boolean {
  const pos1 = edit1.position;
  const len1 = edit1.operation === 'delete' 
    ? parseInt(edit1.content) || 1
    : edit1.content.length;

  const pos2 = edit2.position;
  const len2 = edit2.operation === 'delete'
    ? parseInt(edit2.content) || 1
    : edit2.content.length;

  return (pos1 <= pos2 && pos1 + len1 > pos2) ||
         (pos2 <= pos1 && pos2 + len2 > pos1);
}

/**
 * Create change history entry
 */
export function createChangeHistoryEntry(
  sessionId: string,
  userId: string,
  userName: string,
  action: ChangeHistory['action'],
  details: string
): ChangeHistory {
  return {
    id: crypto.randomUUID(),
    sessionId,
    userId,
    userName,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate collaboration session invite link
 */
export function generateInviteLink(
  sessionId: string,
  role: Participant['role'] = 'editor'
): string {
  const data = btoa(JSON.stringify({
    sessionId,
    role,
    invitedAt: new Date().toISOString(),
  }));
  
  return `${window.location.origin}/collaborate?invite=${encodeURIComponent(data)}`;
}

/**
 * Parse invite link
 */
export function parseInviteLink(inviteData: string): {
  sessionId: string;
  role: Participant['role'];
  invitedAt: string;
} | null {
  try {
    const decoded = atob(decodeURIComponent(inviteData));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse invite link:', error);
    return null;
  }
}

/**
 * Export collaboration session data
 */
export function exportCollaborationData(session: CollaborationSession): string {
  return JSON.stringify(session, null, 2);
}

/**
 * Get collaboration statistics
 */
export function getCollaborationStats(
  sessions: CollaborationSession[],
  edits: CollaborativeEdit[],
  comments: Comment[]
): {
  totalSessions: number;
  activeSessions: number;
  totalParticipants: number;
  totalEdits: number;
  totalComments: number;
  averageSessionDuration: number;
  mostActiveUser: string;
} {
  const activeSessions = sessions.filter(s => s.isActive).length;
  const uniqueParticipants = new Set(
    sessions.flatMap(s => s.participants.map(p => p.id))
  );

  const userEditCounts: Record<string, number> = {};
  edits.forEach(edit => {
    userEditCounts[edit.userId] = (userEditCounts[edit.userId] || 0) + 1;
  });

  const mostActiveUser = Object.keys(userEditCounts).length > 0
    ? Object.keys(userEditCounts).reduce((a, b) => 
        userEditCounts[a] > userEditCounts[b] ? a : b
      )
    : 'None';

  const sessionDurations = sessions.map(s => {
    const start = new Date(s.createdAt).getTime();
    const end = new Date(s.lastActivity).getTime();
    return end - start;
  });

  const averageSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
    : 0;

  return {
    totalSessions: sessions.length,
    activeSessions,
    totalParticipants: uniqueParticipants.size,
    totalEdits: edits.length,
    totalComments: comments.length,
    averageSessionDuration: averageSessionDuration / 1000 / 60, // Convert to minutes
    mostActiveUser,
  };
}
