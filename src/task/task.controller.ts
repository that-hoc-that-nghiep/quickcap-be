import { Body, Controller, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { createTaskDto } from './dto/create-task.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}
  @Post()
  createTask(@Body() createTaskDto: createTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }
}
