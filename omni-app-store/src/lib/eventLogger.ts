import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserEvent {
  type: 'asset_added' | 'asset_removed' | 'profile_updated' | 'app_connected' | 'app_disconnected';
  description: string;
  details?: string;
  timestamp: Timestamp;
}

export const logUserEvent = async (
  userId: string,
  type: UserEvent['type'],
  description: string,
  details?: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'User_Profiles', userId);
    
    const event: UserEvent = {
      type,
      description,
      details,
      timestamp: Timestamp.now()
    };

    await updateDoc(userRef, {
      eventLog: arrayUnion(event)
    });

    console.log('Event logged:', event);
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

export const getEventIcon = (type: UserEvent['type']): string => {
  switch (type) {
    case 'asset_added':
      return '🏭';
    case 'asset_removed':
      return '🗑️';
    case 'profile_updated':
      return '👤';
    case 'app_connected':
      return '🔗';
    case 'app_disconnected':
      return '🔌';
    default:
      return '📋';
  }
};

export const getEventColor = (type: UserEvent['type']): string => {
  switch (type) {
    case 'asset_added':
    case 'app_connected':
      return 'bg-green-500';
    case 'asset_removed':
    case 'app_disconnected':
      return 'bg-red-500';
    case 'profile_updated':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export const formatEventTime = (timestamp: Timestamp): string => {
  const now = new Date();
  const eventDate = timestamp.toDate();
  const diffMs = now.getTime() - eventDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return eventDate.toLocaleDateString();
};
