import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { User, UserApp } from 'src/constants/user';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(
    user: User,
    videoId: string,
    type: string,
    content: string,
  ) {
    const userReport: UserApp = {
      id: user.id,
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
      subscription: user.subscription,
    };
    const newReport = await this.reportRepository.createReport(
      userReport,
      videoId,
      type,
      content,
    );
    return { data: newReport, message: 'Report created successfully' };
  }

  async getReportsByVideoId(videoId: string) {
    const reports = await this.reportRepository.getReportsByVideoId(videoId);
    return { data: reports, message: 'Reports fetched successfully' };
  }

  async acceptReport(reportId: string, videoId: string, type: string) {
    const report = await this.reportRepository.acceptReport(
      reportId,
      videoId,
      type,
    );
    return { data: report, message: 'Report accepted successfully' };
  }
}
