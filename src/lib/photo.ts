export type { StoredMedia as StoredPhoto } from "@/lib/media";
export {
  getMedia as getProfilePhoto,
  mediaPublicUrl as profilePhotoPublicUrl,
} from "@/lib/media";
import { deleteMedia, saveMedia, type StoredMedia } from "@/lib/media";

export async function saveProfilePhoto(photo: StoredMedia) {
  return saveMedia("photo", photo);
}

export async function deleteProfilePhoto() {
  return deleteMedia("photo");
}
