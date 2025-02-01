import { Body, Controller, Delete, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Task } from './task.schema';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('Task')
@Controller('task')
@UseInterceptors(CacheInterceptor)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('test')
  async testRabbitmq() {
    return this.taskService.testRabbitmq();
  }

  @Post()
  @ApiOkResponse({ type: Task })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      task_1: {
        value: {
          title: 'Game 1',
          description: 'Hehe',
        } as CreateTaskDto,
      },
    },
  })
  @ApiOperation({
    summary: 'Create task',
    description: `
    *Create task every day

    *Any where
    `,
  })
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Post(':id')
  @ApiOkResponse({ type: Task })
  updateTask(@Body() updateTaskDto: UpdateTaskDto, @Param('id') id: string) {
    return this.taskService.updateTaskById(updateTaskDto, id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Task })
  async getTaskById(@Param('id') id: string) {
    return await this.taskService.getTaskById(id);
  }

  @Get()
  @ApiOkResponse({ type: Task, isArray: true })
  async getTasks() {
    return await this.taskService.getTasks();
  }

  @Delete(':id')
  @ApiOkResponse({ type: Task })
  async deleteTask(@Param('id') id: string) {
    return await this.taskService.deleteTask(id);
  }
}
