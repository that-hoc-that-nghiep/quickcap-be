import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './task.schema';
import { Model } from 'mongoose';
import { createTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskRepository {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async createTask(createTaskDto: createTaskDto) {
    const { title, description } = createTaskDto;
    const task = new this.taskModel({ title, description });
    return task.save();
  }
  async getTaskById(id: string) {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Id ${id} not found in database`);
    }
    return task;
  }

  async deleteTask(id: string) {
    return await this.taskModel.findByIdAndDelete(id);
  }
}
