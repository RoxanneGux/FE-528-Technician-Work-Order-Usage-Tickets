/** Represents a navigation link in the anchor sidebar. */
export interface AnchorLink {
  /** Display name for the link. */
  name: string;
  /** Fragment ID of the target section (without #). */
  fragment: string;
  /** Optional item count displayed next to the name. */
  count?: number;
  /** Optional Material icon name. */
  icon?: string;
  /** Optional icon color CSS class. */
  iconColor?: string;
}
