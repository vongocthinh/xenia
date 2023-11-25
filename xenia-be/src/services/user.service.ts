import { IUserData, IUserListView } from '@common';
import { UserStoreService } from '@db-service';
import { Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, readdir, unlink } from 'fs';
import { extname, join } from 'path';
import { finished } from 'stream';
import { promisify } from 'util';

const finishedPromise = promisify(finished);

@Injectable()
export class UserService {
  constructor(private readonly userStoreService: UserStoreService) {}

  public async getUsers(
    pageNum: number,
    pageSize: number,
  ): Promise<IUserListView> {
    const data = await this.userStoreService.getAllData(pageNum, pageSize);
    return data;
  }

  public async getUserById(id: number) {
    return await this.userStoreService.getDataById(id);
  }

  public async upsertUser(user: IUserData): Promise<IUserData> {
    const userData = await this.userStoreService.upsertUser(user);
    if (user.id !== undefined && user.avatar) {
      const directoryPath = join(
        __dirname,
        '../..',
        'public',
        'avatar',
        user.id.toString(),
      );
      const urlParts = user.avatar.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await this.removeFilesInDirectory(directoryPath, fileName);
    }
    return userData;
  }

  public async deleteUser(userId: number) {
    await this.userStoreService.deleteUser(userId);
  }

  public async uploadAvatar(userId: string, file: Express.Multer.File) {
    const fileExtension = extname(file.originalname);
    const filename = `${new Date().getTime()}${fileExtension || '.jpg'}`;
    const uploadPath = join(__dirname, '../..', 'public', 'avatar', userId);
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    const writeStream = createWriteStream(join(uploadPath, filename));
    writeStream.write(file.buffer);
    writeStream.end();
    await finishedPromise(writeStream);
    const fileUrl = `static/avatar/${userId}/${filename}`;
    return fileUrl;
  }

  private async removeFilesInDirectory(
    directoryPath: string,
    fileName: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      readdir(directoryPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        const removalPromises = files.map((file) => {
          if (file === fileName) return;
          const filePath = join(directoryPath, file);
          return new Promise<void>((resolveFile, rejectFile) => {
            unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                rejectFile(unlinkErr);
              } else {
                resolveFile();
              }
            });
          });
        });

        Promise.all(removalPromises)
          .then(() => resolve())
          .catch((removeErr) => reject(removeErr));
      });
    });
  }
}
