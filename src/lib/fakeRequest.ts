export function fakeRequest(ms = 700) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function fakeFailure(message: string, ms = 700): Promise<never> {
  await fakeRequest(ms);
  throw new Error(message);
}
