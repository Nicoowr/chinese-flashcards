import { useQuery, useQueryClient } from "react-query";
import {
  type AuthenticatedUser,
  getActiveSession,
  getCurrentUser,
  hydrateSessionFromUrl,
  signOut,
} from "../../lib/supabaseClient";

const authenticatedUserKey = ["authenticated-user"];

const fetchAuthenticatedUser = async () => {
  hydrateSessionFromUrl();
  const activeSession = await getActiveSession();
  return getCurrentUser(activeSession.access_token);
};

export const useAuthenticatedUser = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery<AuthenticatedUser | null>(
    authenticatedUserKey,
    fetchAuthenticatedUser,
    { retry: false, refetchOnWindowFocus: false },
  );

  const loadCurrentUser = async () => {
    await refetch();
  };

  const onLogout = async () => {
    await signOut();
    queryClient.setQueryData(authenticatedUserKey, null);
  };

  const authenticatedUser = isError ? null : data ?? null;

  return {
    authenticatedUser,
    isLoadingSession: isLoading,
    loadCurrentUser,
    onLogout,
  };
};
