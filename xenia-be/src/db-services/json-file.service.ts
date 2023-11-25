import { IUserData, IUserListView } from '@common';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UserStoreService {
  private readonly logger = new Logger('UserStoreService');
  private readonly fileStorageName = 'data.json';
  private readonly fileStoragePath = join(
    __dirname,
    '../..',
    'static-files-storage',
    this.fileStorageName,
  );

  private readData(): Promise<IUserData[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.fileStoragePath, 'utf-8', (error, data) => {
        if (error) {
          this.logger.error('readData', JSON.stringify(error));
          resolve([]);
        } else {
          try {
            const parsedData = JSON.parse(data) as IUserData[];
            resolve(parsedData);
          } catch (parseError) {
            this.logger.error(
              'readData--parseError',
              JSON.stringify(parseError),
            );
            reject(parseError);
          }
        }
      });
    });
  }

  private writeData(data: IUserData[]): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        this.fileStoragePath,
        JSON.stringify(data, null, 2),
        'utf-8',
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  }

  public async getDataById(id: number): Promise<IUserData> {
    const jsonData = await this.readData();
    return jsonData.find((item) => item.id === id);
  }

  public async getAllData(
    pageNum: number,
    pageSize: number,
  ): Promise<IUserListView> {
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const users = await this.readData();
    const cloneUsers = JSON.parse(JSON.stringify(users));
    return {
      count: users.length,
      list: cloneUsers.splice(startIndex, endIndex),
    };
  }

  public async upsertUser(user: IUserData): Promise<IUserData> {
    const users = await this.readData();
    const userSearched = users.find(
      (item) => item.id !== undefined && item.id === user.id,
    );
    if (userSearched) {
      users.splice(user.id, 1);
    } else {
      user.id = users.length;
    }
    users.push(user);
    await this.writeData(users);
    return user;
  }

  public async deleteUser(userId: number) {
    const users = await this.readData();
    const userSearched = users.find(
      (item) => item.id !== undefined && item.id === userId,
    );
    if (userSearched) {
      users.splice(userId, 1);
      await this.writeData(users);
    }
  }
}
