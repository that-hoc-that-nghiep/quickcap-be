import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/constants/user';
import { CreateReportDto } from './dto/create-report.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { ReportType } from 'src/constants/report';
import { ReportRes } from './dto/report.res';
import { ReportsRes } from './dto/reports.res';
import { AcceptReportDto } from './dto/accept-report.dto';

@ApiSecurity('token')
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}
  private logger = new Logger(ReportController.name);
  @ApiOperation({ summary: 'Create report' })
  @ApiParam({ name: 'videoId', type: String })
  @ApiBody({
    type: CreateReportDto,
    examples: {
      report_VIOLENCE: {
        value: {
          type: ReportType.VIOLENCE,
          content: 'This video is VIOLENCE',
        },
      },
      report_PORNOGRAPHY: {
        value: {
          type: ReportType.PORNOGRAPHY,
          content: 'This video is porn',
        },
      },
      report_SEXUAL_CONTENT: {
        value: {
          type: ReportType.SEXUAL_CONTENT,
          content: 'This video is sexy charecters',
        },
      },
      report_ADULT_ANIME: {
        value: {
          type: ReportType.ADULT_ANIME,
          content: 'This video is HENTAI',
        },
      },
    },
  })
  @ApiResponse({ type: ReportRes })
  @Post(':videoId')
  async createReport(
    @GetUser() user: User,
    @Param('videoId') videoId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    try {
      const { type, content } = createReportDto;
      return this.reportService.createReport(user, videoId, type, content);
    } catch (error) {
      this.logger.error('Error creating report', error);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ type: ReportsRes })
  @Get('all')
  async getAllReports() {
    try {
      return this.reportService.getAllReports();
    } catch (error) {
      this.logger.error('Error getting all reports', error);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({ summary: 'Get all reports by videoId' })
  @ApiParam({ name: 'videoId', type: String })
  @ApiResponse({ type: ReportsRes })
  @Get('all/:videoId')
  async getAllReportsByVideoId(@Param('videoId') videoId: string) {
    try {
      return this.reportService.getReportsByVideoId(videoId);
    } catch (error) {
      this.logger.error('Error getting all reports by videoId', error);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({ summary: 'Get report by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ type: ReportsRes })
  @Get(':id')
  async getReportsByVideoId(@Param('id') id: string) {
    try {
      return this.reportService.getReportById(id);
    } catch (error) {
      this.logger.error('Error getting report by id', error);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({ summary: 'Accept report' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'videoId', type: String })
  @ApiResponse({ type: ReportRes })
  @Patch(':id/:videoId')
  async acceptReport(
    @Param('id') reportId: string,
    @Param('videoId') videoId: string,
  ) {
    try {
      return this.reportService.acceptReport(reportId, videoId);
    } catch (error) {
      this.logger.error('Error accepting report', error);
      throw new InternalServerErrorException(error);
    }
  }
}
