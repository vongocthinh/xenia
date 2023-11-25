export interface IUserData {
  id?: number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface IUserListView {
  list: IUserData[];
  count: number;
}
export interface IUserDTO {
  id?: number;
  name: string;
  email?: string;
  avatar?: File;
}
