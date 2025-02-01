import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { createTaskDto } from './dto/create-task.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}
  @Post()
  createTask(@Body() createTaskDto: createTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return await this.taskService.getTaskbyId(id);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return await this.taskService.deleteTask(id);
  }
}
