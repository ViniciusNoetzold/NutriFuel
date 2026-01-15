/* General utility functions (exposes cn, processImage, calculateGoals) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Fill white background (optional, or transparent if png)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1080, 1080)

      // Calculate cover logic
      const scale = Math.max(1080 / img.width, 1080 / img.height)
      const x = (1080 - img.width * scale) / 2
      const y = (1080 - img.height * scale) / 2

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas to Blob failed'))
        },
        'image/jpeg',
        0.9,
      )
    }
    img.onerror = reject
  })
}

export function calculateGoals(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: string,
  goal: string,
) {
  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age
  if (gender === 'male') bmr += 5
  else bmr -= 161

  const activityMultipliers: Record<string, number> = {
    Sedentário: 1.2,
    Leve: 1.375,
    Moderado: 1.55,
    Intenso: 1.725,
    Atleta: 1.9,
  }
  const multiplier = activityMultipliers[activityLevel] || 1.55
  let tdee = bmr * multiplier

  if (goal === 'Emagrecer') tdee -= 500
  else if (goal === 'Ganhar Massa') tdee += 500

  // Ensure minimum safe calories
  if (tdee < 1200) tdee = 1200

  // Macro Split
  let pRatio = 0.3 // Default Balanced
  let cRatio = 0.4
  let fRatio = 0.3

  if (goal === 'Emagrecer') {
    pRatio = 0.4
    cRatio = 0.3
    fRatio = 0.3
  }
  if (goal === 'Ganhar Massa') {
    pRatio = 0.3
    cRatio = 0.5
    fRatio = 0.2
  }

  const calories = Math.round(tdee)
  const protein = Math.round((calories * pRatio) / 4)
  const carbs = Math.round((calories * cRatio) / 4)
  const fats = Math.round((calories * fRatio) / 9)

  // Water: ~35ml per kg
  const water = Math.round(weight * 35)

  return {
    calorieGoal: calories,
    proteinGoal: protein,
    carbsGoal: carbs,
    fatsGoal: fats,
    waterGoal: water,
  }
}
