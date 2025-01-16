import { Injectable } from '@nestjs/common';
import { createTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  createTask(createTaskDto: createTaskDto) {
    const { title, description } = createTaskDto;
    return { title, description };
  }
}
