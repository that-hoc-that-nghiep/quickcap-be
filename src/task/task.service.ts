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
    const task = await new this.taskModel({ title, description });
    return { data: task, message: 'Create new Task successfull' };
  }
  async getTaskById(id: string) {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Id ${id} not found in database`);
    }
    return { data: task, message: 'Get task by id successfull' };
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
    return { data: updateTask, message: 'Update task successfull' };
  }

  async getTasks() {
    const tasks = await this.taskModel.find();
    return { data: tasks, message: 'Get Task success' };
  }

  async deleteTask(id: string) {
    const task = await this.taskModel.findByIdAndDelete(id);
    return { data: task, message: 'Delete succesfull' };
  }
}
