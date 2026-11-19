import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  // 同一个 Service 可以同时注入 Repository 和 Provider
  // RedisService 来自 @Global() 的 RedisModule，所以这里不需要重复 imports
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly redisService: RedisService,
  ) {}

  // 缓存按用户区分，避免不同用户读到彼此的待办
  private cacheKey(userId: number): string {
    return `todos:all:${userId}`;
  }

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      title: createTodoDto.title,
      description: createTodoDto.description ?? null,
      userId,
    });
    const saved = await this.todoRepository.save(todo);
    await this.redisService.del(this.cacheKey(userId));
    return saved;
  }

  async findAll(userId: number): Promise<Todo[]> {
    const key = this.cacheKey(userId);
    const cached = await this.redisService.get(key);
    if (cached) {
      return JSON.parse(cached) as Todo[];
    }

    const todos = await this.todoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    await this.redisService.set(key, JSON.stringify(todos), 60);
    return todos;
  }

  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepository.findOneBy({ id, userId });
    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    await this.todoRepository.update({ id, userId }, updateTodoDto);
    await this.redisService.del(this.cacheKey(userId));
    return this.todoRepository.findOneBy({ id: todo.id }) as Promise<Todo>;
  }

  async remove(id: number, userId: number): Promise<{ deleted: boolean }> {
    await this.findOne(id, userId);
    await this.todoRepository.delete({ id, userId });
    await this.redisService.del(this.cacheKey(userId));
    return { deleted: true };
  }
}
