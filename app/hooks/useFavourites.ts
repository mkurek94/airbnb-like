import { useRouter } from "next/navigation";
import { SafeUser } from "../types";
import { useLoginModal } from "./useLoginModal";
import { useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface IUseFavourite {
  listingId: string;
  currentUser?: SafeUser | null;
}

export const useFavourite = ({ listingId, currentUser }: IUseFavourite) => {
  const router = useRouter();
  const loginModal = useLoginModal();

  const hasFavourited = useMemo(() => {
    const list = currentUser?.favouriteIds || [];

    return list.includes(listingId);
  }, [currentUser, listingId]);

  const toggleFavourite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!currentUser) {
        return loginModal.onOpen();
      }

      try {
        const url = `/api/favourites/${listingId}`;
        let request;

        if (hasFavourited) {
          request = () => axios.delete(url);
        } else {
          request = () => axios.post(url);
        }

        await request();
        router.refresh();
        toast.success("Success");
      } catch {
        toast.error("Something went wrong.");
      }
    },
    [currentUser, listingId, hasFavourited, loginModal, router]
  );

  return {
    hasFavourited,
    toggleFavourite,
  }
};
