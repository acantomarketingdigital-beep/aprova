import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from './qr-codes.entity';
import { QrCodesService } from './qr-codes.service';
import { QrCodesController } from './qr-codes.controller';
import { Employee } from '../employees/employees.entity';
import { Transaction } from '../transactions/transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QrCode, Employee, Transaction])],
  controllers: [QrCodesController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
