import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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
import { isArray } from 'class-validator';

@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}
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
  @ApiParam({
    name: 'id',
    type: 'string',
    examples: {
      id_1: {
        value: '679e2657f758ba9e3ba73bdc',
        description: `id for task 1`,
      },
    },
  })
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
