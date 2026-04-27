/**
 * Utility for Standard Roleplay Dice Rolls
 */

export interface DiceResult {
  roll: number;
  bonus: number;
  total: number;
  sides: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
}

/**
 * Performs a d20 roll (Standard for Stealth/Perception)
 * @param bonus Modifier to add to the roll
 * @returns DiceResult object
 */
export function rollD20(bonus: number = 0): DiceResult {
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + bonus;
  
  return {
    roll,
    bonus,
    total,
    sides: 20,
    isCriticalSuccess: roll === 20,
    isCriticalFailure: roll === 1,
  };
}

/**
 * Performs a d100 roll (Standard for Percentage checks)
 */
export function rollPercentage(bonus: number = 0): DiceResult {
  const roll = Math.floor(Math.random() * 100) + 1;
  const total = Math.min(100, Math.max(0, roll + bonus));
  
  return {
    roll,
    bonus,
    total,
    sides: 100,
    isCriticalSuccess: roll === 100,
    isCriticalFailure: roll === 1,
  };
}

/**
 * Check success against a Difficulty Class (DC)
 */
export function checkSuccess(rollResult: DiceResult, dc: number): boolean {
  if (rollResult.isCriticalSuccess) return true;
  if (rollResult.isCriticalFailure) return false;
  return rollResult.total >= dc;
}
