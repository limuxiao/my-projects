import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../users/interfaces/jwt-payload.interface';
import { SearchStudyDto } from './dto/search-study.dto';
import { StudyService } from './study.service';

// 课程数据是公开只读的；只有进度接口挂 JwtAuthGuard 并按 userId 隔离
@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('overview')
  overview() {
    return this.studyService.getOverview();
  }

  @Get('units')
  units() {
    return this.studyService.getUnits();
  }

  @Get('days/search')
  search(@Query() dto: SearchStudyDto) {
    return this.studyService.search(dto.q);
  }

  @Get('days/:globalDay')
  day(@Param('globalDay', ParseIntPipe) globalDay: number) {
    return this.studyService.getDay(globalDay);
  }

  @Get('words/:id/audio')
  async wordAudio(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const audio = await this.studyService.getWordAudio(id);
    if (!audio) throw new NotFoundException(`Audio for word ${id} not found`);
    res.setHeader('Content-Type', 'audio/m4a');
    res.setHeader('Content-Length', audio.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(audio);
  }

  @Get('films')
  films() {
    return this.studyService.getFilms();
  }

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  progress(@CurrentUser() user: JwtPayload) {
    return this.studyService.getProgress(user.sub);
  }

  @Post('progress/:globalDay')
  @UseGuards(JwtAuthGuard)
  markDone(
    @Param('globalDay', ParseIntPipe) globalDay: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studyService.markDone(user.sub, globalDay);
  }

  @Delete('progress/:globalDay')
  @UseGuards(JwtAuthGuard)
  unmarkDone(
    @Param('globalDay', ParseIntPipe) globalDay: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studyService.unmarkDone(user.sub, globalDay);
  }
}
