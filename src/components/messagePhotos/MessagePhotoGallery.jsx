import ForumPhotoGallery from "../forumPhotos/ForumPhotoGallery";

export default function MessagePhotoGallery({ images, token, senderName }) {
  if (!images?.length) return null;
  return (
    <div className="dm-photo-gallery">
      <ForumPhotoGallery
        images={images}
        token={token}
        label={`Photo from ${senderName || "member"}`}
      />
    </div>
  );
}
