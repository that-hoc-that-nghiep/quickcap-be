import { Injectable } from '@nestjs/common';
import { createTaskDto } from './dto/create-task.dto';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(private taskRepository: TaskRepository) {}
  createTask(createTaskDto: createTaskDto) {
    return this.taskRepository.createTask(createTaskDto);
  }
  async getTaskbyId(id: string) {
    return await this.taskRepository.getTaskById(id);
  }

  async deleteTask(id: string) {
    return await this.taskRepository.deleteTask(id);
  }
}
