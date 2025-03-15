import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './report.schema';
import { VideoModule } from 'src/video/video.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    VideoModule,
  ],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
