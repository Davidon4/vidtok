/**
 * Post overlay-related TypeScript types and interfaces
 */

export interface PostOverlayProps {
    posterName: string;
    onLikePress?: () => void;
    isLiked?: boolean;
    timestamp?: Date | string;
    likes?: number;
  }