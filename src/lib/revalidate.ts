import { revalidatePath } from "next/cache";

export function revalidateHome() {
  try {
    revalidatePath("/");
  } catch {
    // revalidatePath no-ops in dev; ignore
  }
}
