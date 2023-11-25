import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { UserModal } from "./components";
import { IUserData } from "./common";
import "./App.css";
import { compressImage } from "./util/ImageUtil";
import { Pagination } from "./components/Pagination";

interface IPaginationParams {
  pageNum: number;
  count: number;
}

function App() {
  const baseApiUrl = "http://localhost:4000/user";
  const [data, setData] = useState<IUserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUserData | undefined>();
  const [iAdding, setIsAdding] = useState(false);
  const [avatar, setAvatar] = useState<File>();
  const [pagingPrams, setPagingPrams] = useState<IPaginationParams>({
    pageNum: 1,
    count: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${baseApiUrl}?pageNum=${pagingPrams.pageNum}&pageSize=${10}`);
      if (res.data?.list?.length > 0) {
        setData(res.data.list);
        setPagingPrams({
          ...pagingPrams,
          count: res.data.count,
        });
      }
    } catch (err) {
      console.log(err);
      alert("Error fetching data");
    }
  }, [pagingPrams]);

  const handleRemoveUser = useCallback(async (userId?: number) => {
    if (!window.confirm("Do you want to delete this user?")) {
      return;
    }
    try {
      await axios.post(`${baseApiUrl}/delete`, { userId });
      fetchData();
    } catch (err) {
      console.log(err);
      alert("Delete failed!");
    } finally {
      await fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateUser = useCallback((user: IUserData) => {
    setIsAdding(false);
    setIsModalOpen(true);
    setSelectedUser(user);
  }, []);

  const handleSaveChanges = useCallback(async (userData: IUserData) => {
    try {
      const user = (await axios.post(baseApiUrl, userData)).data;
      if (iAdding && avatar && user.id !== undefined) {
        const compressedImage = await compressImage(avatar, 200);
        const formData = new FormData();
        formData.append("image", compressedImage);
        const uploadedUrl = await axios.post(
          `http://localhost:4000/user/${user.id}/avatar`,
          formData
        );
        user.avatar =
          `http://localhost:4000/${uploadedUrl.data?.url}` as string;
        await axios.post(baseApiUrl, user);
        setIsAdding(false);
      }
    } catch (err) {
      console.log(err);
      alert("Update failed!");
    } finally {
      await fetchData();
    }
    setIsModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatar, iAdding]);

  const handleAddUser = useCallback(async () => {
    setIsAdding(true);
    setSelectedUser(undefined);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    axios
      .get(`${baseApiUrl}?pageNum=${pagingPrams.pageNum}&pageSize=${10}`)
      .then((response) => {
        setData(response.data.list);
        setPagingPrams({
          pageNum: pagingPrams.pageNum,
          count: response.data.count,
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagingPrams.pageNum]);
  return (
    <div className="backgroundContainer">
      <div className="container">
        <div className="contentWrapper">
          <h1 className="centerContent">User List</h1>
          <div className="leftAlignContent">
            <div>
              <button
                className="button"
                style={{ backgroundColor: "#04AA6D" }}
                onClick={() => handleAddUser()}
              >
                Add
              </button>
            </div>
            <div style={{ paddingLeft: 10 }}>Add a new user</div>
          </div>
          <hr />
          <div className="leftAlignContent" style={{ display: "block" }}>
            <div>User board</div>
            <table id="users">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.avatar ? (
                        <div className="centerContent">
                          <img
                            src={user.avatar}
                            alt={`${user.name}'s avatar`}
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              border: "1px #DCDCDC solid",
                            }}
                          />
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="centerContent">
                        <button
                          className="button"
                          style={{ backgroundColor: "#008CBA" }}
                          onClick={() => handleUpdateUser(user)}
                        >
                          Update
                        </button>
                        <button
                          className="button"
                          style={{ backgroundColor: "#8B0000" }}
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagingPrams.count > 0 && (
            <div className="centerContent">
              <Pagination
                totalItems={pagingPrams.count}
                itemsPerPage={10}
                setCurrentPage={(pageNum) =>
                  setPagingPrams({ ...pagingPrams, pageNum })
                }
              />
            </div>
          )}
          {isModalOpen && (
            <UserModal
              onClose={() => setIsModalOpen(false)}
              onSaveChanges={handleSaveChanges}
              onSetAvatar={setAvatar}
              initialUserData={selectedUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
