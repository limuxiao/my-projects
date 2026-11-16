import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  private readonly cacheKey = 'todos:all';

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly redisService: RedisService,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create({
      title: createTodoDto.title,
      description: createTodoDto.description ?? null,
    });
    const saved = await this.todoRepository.save(todo);
    await this.redisService.del(this.cacheKey);
    return saved;
  }

  async findAll(): Promise<Todo[]> {
    const cached = await this.redisService.get(this.cacheKey);
    if (cached) {
      return JSON.parse(cached) as Todo[];
    }

    const todos = await this.todoRepository.find({ order: { createdAt: 'DESC' } });
    await this.redisService.set(this.cacheKey, JSON.stringify(todos), 60);
    return todos;
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    await this.todoRepository.update(id, updateTodoDto);
    await this.redisService.del(this.cacheKey);
    return this.todoRepository.findOneBy({ id: todo.id }) as Promise<Todo>;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.todoRepository.delete(id);
    await this.redisService.del(this.cacheKey);
    return { deleted: true };
  }
}
