import { Module } from '@nestjs/common';
import { DataServiceModule } from '@db-service';
import { UserController } from '@controllers';
import { UserService } from '@services';

@Module({
  imports: [DataServiceModule],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
