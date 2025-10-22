import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function formatEnumString(str: string) {
//   return str.replace(/([A-Z])/g, " $1").trim();
// }

// export function formatPriceValue(value: number | null, isMin: boolean) {
//   if (value === null || value === 0)
//     return isMin ? "Any Min Price" : "Any Max Price";
//   if (value >= 1000) {
//     const kValue = value / 1000;
//     return isMin ? `$${kValue}k+` : `<$${kValue}k`;
//   }
//   return isMin ? `$${value}+` : `<$${value}`;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanParams(params: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(params).filter(
      (
        [_, value] // eslint-disable-line @typescript-eslint/no-unused-vars
      ) =>
        value !== undefined &&
        value !== "any" &&
        value !== "" &&
        (Array.isArray(value) ? value.some((v) => v !== null) : value !== null)
    )
  );
}

type MutationMessages = {
  success?: string;
  error: string;
};

export const withToast = async <T>(
  mutationFn: Promise<T>,
  messages: Partial<MutationMessages>
) => {
  const { success, error } = messages;

  try {
    const result = await mutationFn;
    if (success) toast.success(success);
    return result;
  } catch (err) {
    if (error) toast.error(error);
    throw err;
  }
};

export const createNewUserInDatabase = async (
  user: string | any,
  idToken: string | any,
  userRole: string,
  fetchWithBQ: string | any
) => {
  // Map user roles to their respective creation endpoints
  const roleToEndpointMap: Record<string, string> = {
    student: "/students",
    mentor: "/mentors",
    librarian: "/librarians",
  };

  const lowerRole = userRole?.toLowerCase();

  const createEndpoint = roleToEndpointMap[lowerRole];
  if (!createEndpoint) {
    throw new Error(`Invalid user role: ${userRole}`);
  }

  const createUserResponse = await fetchWithBQ({
    url: createEndpoint,
    method: "POST",
    body: {
      cognitoId: user.userId,
      username: user.username,
      email: idToken?.payload?.email || ""
    },
  });

  if (createUserResponse.error) {
    throw new Error("Failed to create user record");
  }

  return createUserResponse;
};
