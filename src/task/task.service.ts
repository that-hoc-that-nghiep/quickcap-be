import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './task.schema';
import { Model } from 'mongoose';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}
  async createTask(createTaskDto: CreateTaskDto) {
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

  async updateTaskById(updateTaskDto: UpdateTaskDto, id: string) {
    const { title, description } = updateTaskDto;
    const updateTask = await this.taskModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description,
        },
      },
      { new: true, upsert: false },
    );
    if (!updateTask) {
      throw new NotFoundException(`Task ${id} not found in database.`);
    }
    return updateTask;
  }

  async getTasks() {
    const tasks = await this.taskModel.find();
    return tasks;
  }

  async deleteTask(id: string) {
    return await this.taskModel.findByIdAndDelete(id);
  }
}
