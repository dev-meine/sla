export interface OrderableBoardMember {
  name: string;
  position: string;
  display_order?: number | null;
}

/**
 * Official Sierra Leone Aquatics Executive Board protocol order:
 * 1. President (Mohamed Abdul Turay)
 * 2. Vice-President (Philip Momoh Bangura)
 * 3. Secretary General (Abdul Turay)
 * 4. Asst. Secretary General (Jadakris Kamara)
 * 5. Treasurer (Kadiatu Kalilu)
 * 6. Women's Rep (Hawa Dauda)
 * 7. Public Relations Officers (Reginald Brian O. Sawyerr, Lydia Y. Tucker)
 * 8. Members (Ibrahim S. Mansaray, James Fassineh Koroma)
 * 9. Honorary President (George Spilsbury-Williams)
 */
export function getExecutiveProtocolRank(member: OrderableBoardMember): number {
  const pos = (member.position || '').toLowerCase().trim();
  const name = (member.name || '').toLowerCase().trim();

  // Honorary President sits at the end of the official roster
  if (pos.includes('honorary') || name.includes('spilsbury')) {
    return 90;
  }

  // Vice-President (must check before President)
  if (
    (pos.includes('vice') && pos.includes('president')) ||
    /\bvp\b/.test(pos)
  ) {
    return 20;
  }

  // President
  if (pos.includes('president')) {
    return 10;
  }

  // Assistant / Deputy Secretary General (must check before Secretary General)
  if (
    (pos.includes('asst') || pos.includes('assistant') || pos.includes('deputy')) &&
    pos.includes('secretary')
  ) {
    return 40;
  }

  // Secretary General
  if (pos.includes('secretary')) {
    return 30;
  }

  // Treasurer
  if (pos.includes('treasurer')) {
    return 50;
  }

  // Women's Representative
  if (pos.includes('women')) {
    return 60;
  }

  // Public Relations Officers (PRO 1 before PRO 2)
  if (
    pos.includes('public') ||
    pos.includes('publice') ||
    pos.includes('relations') ||
    /\bpro\b/.test(pos) ||
    /\bpro\s*[12]\b/.test(pos)
  ) {
    if (pos.includes('1') || name.includes('reginald') || name.includes('sawyerr')) {
      return 70;
    }
    if (pos.includes('2') || name.includes('lydia') || name.includes('tucker')) {
      return 71;
    }
    return 72;
  }

  // Executive Members (Ibrahim S. Mansaray, James Fassineh Koroma)
  if (pos.includes('member') || pos.includes('ex-officio') || pos.includes('ex officio')) {
    if (name.includes('ibrahim') || name.includes('mansaray')) {
      return 80;
    }
    if (name.includes('james') || name.includes('koroma') || name.includes('fassineh')) {
      return 81;
    }
    return 82;
  }

  return 100;
}

export function sortBoardMembers<T extends OrderableBoardMember>(members: T[]): T[] {
  return [...members].sort((a, b) => {
    const aCustom = typeof a.display_order === 'number' && !Number.isNaN(a.display_order);
    const bCustom = typeof b.display_order === 'number' && !Number.isNaN(b.display_order);

    if (aCustom && bCustom && a.display_order !== b.display_order) {
      return (a.display_order as number) - (b.display_order as number);
    }
    if (aCustom && !bCustom) return -1;
    if (!aCustom && bCustom) return 1;

    const rankDiff = getExecutiveProtocolRank(a) - getExecutiveProtocolRank(b);
    if (rankDiff !== 0) return rankDiff;

    return a.name.localeCompare(b.name);
  });
}
