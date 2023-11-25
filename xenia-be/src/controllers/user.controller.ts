import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { IUserData, IUserListView } from '@common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  private isUploading = false;
  private readonly logger = new Logger('UserController');
  constructor(private readonly userService: UserService) {}

  private responseError(err: Error) {
    this.logger.error(JSON.stringify(err));
    throw new BadRequestException({ message: 'Internal issue' });
  }
  @Get()
  public async getUsers(
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
  ): Promise<IUserListView> {
    try {
      return await this.userService.getUsers(pageNum, pageSize);
    } catch (err) {
      this.responseError(err);
    }
  }

  @Get(':id')
  public async getUserById(@Param('id') id: string) {
    try {
      const userId = parseInt(id);
      return await this.userService.getUserById(userId);
    } catch (err) {
      this.responseError(err);
    }
  }

  @Post()
  public async upsert(@Body() user: IUserData): Promise<IUserData> {
    try {
      return await this.userService.upsertUser(user);
    } catch (err) {
      this.responseError(err);
    }
  }

  @Post('delete')
  public async delete(@Body('userId') userId: number) {
    try {
      await this.userService.deleteUser(userId);
    } catch (err) {
      this.responseError(err);
    }
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('image', { limits: { files: 1, fileSize: 2000000 } }),
  )
  public async uploadAvatar(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (this.isUploading) {
      throw new HttpException(
        { message: 'Concurrent uploads not allowed' },
        HttpStatus.CONFLICT,
      );
    }
    try {
      this.isUploading = true;
      const fileUrl = await this.userService.uploadAvatar(userId, file);
      this.isUploading = false;
      return { url: fileUrl };
    } catch (err) {
      this.isUploading = false;
      this.responseError(err);
    }
  }
}
