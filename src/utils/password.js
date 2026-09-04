// Client-side mirror of the server password policy
// (ims-backend/src/common/is-valid-password.decorator.ts). The server is
// still the source of truth; this just gives a friendlier message before
// the request goes out.

export const PW_HINT = "At least 8 characters, with a letter and a number.";

export function passwordProblem(pw) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 72) return "Password must be at most 72 characters.";
  if (!/[A-Za-z]/.test(pw)) return "Password must contain a letter.";
  if (!/\d/.test(pw)) return "Password must contain a number.";
  return null;
}

// A random policy-compliant password for the admin "Reset password" action.
// 12 chars, guaranteed at least one letter and one digit.
export function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  let out = pick("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz") + pick("23456789");
  for (let i = 0; i < 10; i++) out += pick(chars);
  // shuffle so the guaranteed letter/digit aren't always in front
  return out
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
