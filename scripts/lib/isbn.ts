export function normalizeIsbn(value: string): string {
  return value.replace(/[-\s]/g, '').toUpperCase()
}

export function isValidIsbn10(value: string): boolean {
  const isbn = normalizeIsbn(value)
  if (!/^\d{9}[\dX]$/.test(isbn)) return false

  const total = [...isbn].reduce((sum, character, index) => {
    const digit = character === 'X' ? 10 : Number(character)
    return sum + digit * (10 - index)
  }, 0)
  return total % 11 === 0
}

export function isValidIsbn13(value: string): boolean {
  const isbn = normalizeIsbn(value)
  if (!/^\d{13}$/.test(isbn)) return false

  const total = [...isbn].slice(0, 12).reduce((sum, character, index) => {
    return sum + Number(character) * (index % 2 === 0 ? 1 : 3)
  }, 0)
  return (10 - (total % 10)) % 10 === Number(isbn[12])
}

export function isValidIsbn(value: string): boolean {
  const isbn = normalizeIsbn(value)
  return isbn.length === 10 ? isValidIsbn10(isbn) : isValidIsbn13(isbn)
}
