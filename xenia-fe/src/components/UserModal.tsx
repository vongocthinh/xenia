import { ChangeEvent, useRef, useState } from "react";
import { IUserData } from "../common";
import "./UserModal.css";
import axios, { AxiosError } from "axios";
import { compressImage } from "../util/ImageUtil";

interface UserModalProps {
  onClose: () => void;
  onSaveChanges: (userData: IUserData) => void;
  onSetAvatar: (image: File) => void;
  initialUserData?: IUserData;
}

export const UserModal = ({
  onClose,
  onSaveChanges,
  onSetAvatar,
  initialUserData,
}: UserModalProps) => {
  const [userData, setUserData] = useState(initialUserData);
  const [progress, setProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(initialUserData?.avatar);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!initialUserData) {
        onSetAvatar(file);
        return;
      }
      try {
        const compressedImage = await compressImage(file, 200);
        if (!compressedImage) return;
        const formData = new FormData();
        formData.append("image", compressedImage);
        const uploadedUrl = await axios.post(
          `http://localhost:4000/user/${initialUserData.id}/avatar`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percentage = progressEvent.total
                ? (progressEvent.loaded / progressEvent.total) * 100
                : 0;
              setProgress(percentage);
            },
          }
        );
        const avatarPath = uploadedUrl.data?.url as string;
        if (avatarPath) {
          setUserData({
            ...userData,
            avatar: `http://localhost:4000/${avatarPath}`,
          });
          setAvatarUrl(`http://localhost:4000/${avatarPath}`);
        }
      } catch (err) {
        if (fileRef.current) fileRef.current.value = "";
        const { response } = err as AxiosError<{ message: string }>;
        alert(response?.data?.message || "Upload failed!");
      }
    }
  };

  const handleSave = () => {
    onSaveChanges({ ...userData });
    onClose();
  };

  return (
    <div className="darkBG">
      <div className="centered">
        <div className="modal">
          <div className="modalHeader">
            <h2 className="heading">
              {initialUserData ? "Update User" : "Add a new user"}
            </h2>
          </div>
          <button className="closeBtn" onClick={onClose}>
            x
          </button>
          <div className="modalContent">
            <form style={{ paddingLeft: 10 }}>
              <div className="itemContainer">
                <span className="itemLabel">Name:</span>
                <input
                  type="text"
                  name="name"
                  value={userData?.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="itemContainer">
                <span className="itemLabel">Email:</span>
                <input
                  type="text"
                  name="email"
                  value={userData?.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="itemContainer">
                <span>Update avatar:</span>
              </div>
              <div className="itemContainer">
                <input
                  type="file"
                  ref={fileRef}
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </form>
            {avatarUrl && (
              <span className="avatarContainer">
                <img
                  src={avatarUrl}
                  alt="Preview"
                  className="avatarImage"
                />
              </span>
            )}
            {progress > 0 && progress < 100 && (
              <div>
                <label>Progress: {progress.toFixed(2)}%</label>
                <progress value={progress} max={100}></progress>
              </div>
            )}
          </div>
          <div className="modalActions">
            <div className="actionsContainer">
              <button type="button" onClick={handleSave}>
                Save Changes
              </button>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
