import { getImageUrl } from "../../utils/image";

const Avatar = ({
  src,
  alt,
  size = 45,
  className = "",
}) => {
  return (
    <img
      src={getImageUrl(src)}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
      onError={(e) => {
        e.target.src = "/default-avatar.png";
      }}
    />
  );
};

export default Avatar;