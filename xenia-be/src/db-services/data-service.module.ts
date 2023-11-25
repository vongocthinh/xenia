import { Global, Module } from '@nestjs/common';
import { UserStoreService } from './json-file.service';

@Global()
@Module({
  providers: [UserStoreService],
  exports: [UserStoreService],
})
export class DataServiceModule {}
